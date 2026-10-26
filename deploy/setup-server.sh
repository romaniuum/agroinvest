#!/bin/sh
# Первичная настройка чистого Ubuntu 24.04. Запускать один раз от root:
#   sh setup-server.sh
# Перед запуском в /root/.ssh/authorized_keys должен быть ваш SSH-ключ —
# после настройки вход по паролю и под root будет закрыт.
set -eu

DEPLOY_USER=deploy
APP_DIR=/opt/agroinvest

if [ ! -s /root/.ssh/authorized_keys ]; then
  echo "Нет /root/.ssh/authorized_keys — добавьте SSH-ключ, иначе потеряете доступ."
  exit 1
fi

echo "== Обновления и пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get -y upgrade
apt-get install -y docker.io docker-compose-v2 ufw unattended-upgrades fail2ban

echo "== Автоматические обновления безопасности"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

echo "== Docker: зеркало Docker Hub и ограничение логов"
# Docker Hub из России открывается не всегда, поэтому образы тянем через зеркало Google.
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://mirror.gcr.io"],
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
EOF
systemctl enable docker
systemctl restart docker

echo "== Swap 2 ГБ (сервер с 2 ГБ памяти)"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "== Пользователь $DEPLOY_USER"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash -G docker "$DEPLOY_USER"
fi
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
install -m 600 -o "$DEPLOY_USER" -g "$DEPLOY_USER" \
  /root/.ssh/authorized_keys "/home/$DEPLOY_USER/.ssh/authorized_keys"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR" "$APP_DIR/backups"

echo "== SSH: только по ключу, без root"
cat > /etc/ssh/sshd_config.d/99-agroinvest.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
EOF
systemctl restart ssh

echo "== Файрвол: 22, 80, 443"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo
echo "Готово. Дальше входите как $DEPLOY_USER@<IP-сервера>."
echo "Положите $APP_DIR/.env (образец — deploy/.env.example) и запустите деплой из GitHub."
