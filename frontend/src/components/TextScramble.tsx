import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import s from "./TextScramble.module.css";

interface TextItem {
  text: string;
  delay?: number;
  ststop?: number;
}

const TextScramble: React.FC<{ texts: TextItem[] }> = ({ texts }) => {
  const [displayedText, setDisplayedText] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  let newStart = true;

  useEffect(() => {
    effect();
  }, [currentIndex, texts]);

  async function effect() {
    if (texts.length === 0) return;

    if (newStart && texts[0].ststop && texts[0].ststop > 0) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(1);
        }, (texts[0].ststop ?? 0) * 1000);
      });
      newStart = false;
      texts[0].ststop = 0;
    }

    const currentText = texts[currentIndex];
    const nextText = currentText?.text;
    const chars =
      "abcdefghijklmnopqrstuvwxyz!@#$%^&*()[]{}<λ∑∫π∞✓漢字開発者▓█╢▒░▓█╢▒░▓█╢▒░▓█╢▒░▓▼◘□Ω";

    // setDisplayedText(Array(nextText.length).fill(""));
    for (
      let i = 0;
      i < Math.max(nextText.length, displayedText.join("").trimEnd().length);
      i++
    ) {
      // for (let i = 0; i < nextText.length; i++) {
      const tl = gsap.timeline({ delay: i * 0.07 });

      for (let j = 0; j < 3; j++) {
        tl.to(
          {},
          {
            duration: 0.1,
            onStart: () => {
              setDisplayedText((prev) => {
                const newText = [...prev];
                newText[i] = chars[Math.floor(Math.random() * chars.length)];
                return newText;
              });
            },
          }
        );
      }

      tl.to(
        {},
        {
          duration: 0.25,
          onComplete: () => {
            setDisplayedText((prev) => {
              const newText = [...prev];
              newText[i] = nextText[i] ?? " ";
              return newText;
            });
            // handleCharComplete(i);
          },
        }
      );
    }

    const nextTimer = setTimeout(() => {
      console.log(currentIndex);
      setCurrentIndex(() =>
        currentIndex + 1 >= texts.length ? 0 : currentIndex + 1
      );
    }, (texts[currentIndex].delay || 0) * 1000);

    return () => clearTimeout(nextTimer);
  }

  return (
    <div className={`font-mono text-2xl   `}>
      <div>
        {displayedText.map((char, index) => (
          <span className={s.container} key={`${index}- || 0}`}>
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TextScramble;
