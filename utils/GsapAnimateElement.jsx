// utils/GsapAnimateElement.js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GsapAnimateElement = (elements, fromProps, toProps, scrollTriggerProps) => {
  const targets = typeof elements === "string" ? gsap.utils.toArray(elements) : elements;

  targets.forEach((target, i) => {
    gsap.fromTo(
      target,
      fromProps,
      {
        ...toProps,
        ease: "none",
        scrollTrigger: {
          trigger: target,
          scrub: true,
          // markers: true,
          ...scrollTriggerProps,
        },
      }
    );
  });
};

export default GsapAnimateElement;
