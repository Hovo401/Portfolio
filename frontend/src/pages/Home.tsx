import Header from "../components/Header/Header";
import TextScramble from "../components/TextScramble";

function Home() {
  return (
    <>
      <Header />
      <TextScramble
        key={1}
        texts={[{ text: "HOME 5", delay: 1, ststop: 0.5 }]}
      />
      <hr />
      <TextScramble
        key={2}
        texts={[
          { text: "random text generated in grok", delay: 6, ststop: 3 },
          { text: "Hovo401", delay: 3 },
        ]}
      />
      test text
    </>
  );
}

export default Home;
