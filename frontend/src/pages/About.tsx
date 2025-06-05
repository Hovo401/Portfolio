import Header from "../components/Header/Header";
import TextScramble from "../components/TextScramble";

function About() {
  return (
    <>
      <Header />
      <TextScramble texts={[{ text: "About", delay: 1 }]} />
      <hr />
      <TextScramble
        key={2}
        texts={[
          {
            text: "apris vor asasecir minchev jamy 2-y ",
            delay: 8,
            ststop: 2,
          },
          { text: "aracaca and Diotek", delay: 4 },
        ]}
      />
    </>
  );
}

export default About;
