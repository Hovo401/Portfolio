// import Header from "../components/Header/Header";
import TextScramble from "../components/TextScramble";
import DynamicBg from "../components/dynamic_bg/DynamicBg";

function Home() {
  return (
    <div className="bg-[#1E1B38] flex justify-center text-white">
      {/* <Header /> */}
      <div className="absolute top-[10px] left-[0px]">
        <img src="Logo.png" className="h-[60px]" alt="" />
      </div>
      <DynamicBg />
      <hr />
      <div className="absolute top-[0px] select-none m-auto max-w-[450px] mt-[15%]">
        <TextScramble
          texts={[
            { text: "Hello", delay: 28, ststop: 2 },
            // { text: "⨋⩑⨋▒⨞", delay: 13, ststop: 0 },
          ]}
        />
        <hr />
        <TextScramble
          texts={[
            { text: "My name is Hovhannes", delay: 5, ststop: 6 },
            { text: "I am in development ", delay: 5 },
            { text: "BackEnd  ", delay: 3 },
            { text: "- FrontEnd  ", delay: 3 },
            { text: "  - DevOps  ", delay: 3 },
            { text: "             Hovo401", delay: 8 },
          ]}
        />
      </div>

      <div className="flex items-center space-x-2 mt-2 fixed left-[0px] select-none bottom-[0px] pb-2 pl-2">
        <a href="https://github.com/Hovo401" target="_blank">
          <img
            src="github.svg"
            alt="Github"
            className="w-8 h-8 cursor-pointer   hover:scale-110 "
          />
        </a>
        <a href="https://www.linkedin.com/in/hovo401" target="_blank">
          <img
            src="linkedin.svg"
            alt="Facebook"
            className="w-8 h-8 cursor-pointer hover:scale-110"
          />
        </a>
        <div className="flex items-center gap-2">
          <img
            src="https://icons.iconarchive.com/icons/dtafalonso/win-10x/128/Email-icon.png"
            className="w-7 h-7 "
            alt=""
          />
          <p className="select-text px-1"> hovo@diotek.xyz </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
