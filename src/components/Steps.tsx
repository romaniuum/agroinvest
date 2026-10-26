import ui from "./ui.module.css";
import s from "./Steps.module.css";

const steps = [
  {
    title: "Звоните или оставляете заявку",
    text: "Расскажите, что случилось. Подскажем, что делать прямо сейчас.",
  },
  {
    title: "Мастер приезжает",
    text: "Приедем в удобное время, осмотрим котёл и найдём причину.",
  },
  {
    title: "Согласуем цену и делаем",
    text: "Называем цену до начала работ. Делаем только после вашего согласия.",
  },
  {
    title: "Даём гарантию",
    text: "На выполненные работы даём гарантию.",
  },
];

export function Steps() {
  return (
    <section className={ui.section} aria-labelledby="steps-title">
      <div className={ui.container}>
        <h2 id="steps-title" className={ui.h2}>
          Как мы работаем
        </h2>
        <ol className={s.list}>
          {steps.map((step, i) => (
            <li key={step.title} className={s.step}>
              <span className={s.number} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={s.title}>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
