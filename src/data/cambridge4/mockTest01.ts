import type {
  AnswerKeyEntry,
  ChoiceOption,
  MockTest,
  Question,
  TestAsset,
} from "../../domain/examTypes";
import { test1ListeningPartTextsBySection } from "./listeningTextOverrides";

function imagePage(page: number, description: string): TestAsset {
  return {
    id: `test1-page-${page}`,
    type: "image",
    path: `/assets/mock-test-01/pages/test1-page-${String(page).padStart(
      3,
      "0",
    )}.png`,
    description,
  };
}

function answerKey(
  questionId: string,
  number: number,
  acceptedAnswers: string[],
  displayAnswer = acceptedAnswers.join(" / "),
): AnswerKeyEntry {
  return { questionId, number, acceptedAnswers, displayAnswer };
}

const tfngOptions: ChoiceOption[] = ["TRUE", "FALSE", "NOT GIVEN"].map(
  (value) => ({ id: value, label: value, text: value }),
);

function choiceOptions(entries: Array<[string, string]>): ChoiceOption[] {
  return entries.map(([id, text]) => ({ id, label: id, text }));
}

const abcOptions = ["A", "B", "C"].map((value) => ({
  id: value,
  label: value,
  text: value,
}));

const assets: TestAsset[] = [
  ...Array.from({ length: 23 }, (_, index) =>
    imagePage(index + 11, `Cambridge IELTS 4 Test 1 source page ${index + 11}`),
  ),
  {
    id: "test1-section-1-audio",
    type: "audio",
    path: "/assets/mock-test-01/audio/mock-test-01-listening-section-1.mp3",
    description: "Listening Test 1 Section 1 audio",
  },
  {
    id: "test1-section-2-audio",
    type: "audio",
    path: "/assets/mock-test-01/audio/mock-test-01-listening-section-2.mp3",
    description: "Listening Test 1 Section 2 audio",
  },
  {
    id: "test1-section-3-audio",
    type: "audio",
    path: "/assets/mock-test-01/audio/mock-test-01-listening-section-3.mp3",
    description: "Listening Test 1 Section 3 audio",
  },
  {
    id: "test1-section-4-audio",
    type: "audio",
    path: "/assets/mock-test-01/audio/mock-test-01-listening-section-4.mp3",
    description: "Listening Test 1 Section 4 audio",
  },
  {
    id: "visual-symbols-fig-1",
    type: "image",
    path: "/assets/mock-test-01/figures/visual-symbols-fig-1.png",
    description: "Reading Passage 3 Fig. 1",
  },
  {
    id: "movement-diagrams-q30-32",
    type: "image",
    path: "/assets/mock-test-01/figures/movement-diagrams-q30-32.png",
    description: "Reading Passage 3 Questions 30-32 movement diagrams",
  },
];

const readingPassage1Body = [
  "Adults and children are frequently confronted with statements about the alarming rate of loss of tropical rainforests. For example, one graphic illustration to which children might readily relate is the estimate that rainforests are being destroyed at a rate equivalent to one thousand football fields every forty minutes - about the duration of a normal classroom period. In the face of the frequent and often vivid media coverage, it is likely that children will have formed ideas about rainforests - what and where they are, why they are important, what endangers them - independent of any formal tuition. It is also possible that some of these ideas will be mistaken.",
  "Many studies have shown that children harbour misconceptions about 'pure', curriculum science. These misconceptions do not remain isolated but become incorporated into a multifaceted, but organised, conceptual framework, making it and the component ideas, some of which are erroneous, more robust but also accessible to modification. These ideas may be developed by children absorbing ideas through the popular media. Sometimes this information may be erroneous. It seems schools may not be providing an opportunity for children to re-express their ideas and so have them tested and refined by teachers and their peers.",
  "Despite the extensive coverage in the popular media of the destruction of rainforests, little formal information is available about children's ideas in this area. The aim of the present study is to start to provide such information, to help teachers design their educational strategies to build upon correct ideas and to displace misconceptions and to plan programmes in environmental studies in their schools.",
  "The study surveys children's scientific knowledge and attitudes to rainforests. Secondary school children were asked to complete a questionnaire containing five open-form questions. The most frequent responses to the first question were descriptions which are self-evident from the term 'rainforest'. Some children described them as damp, wet or hot. The second question concerned the geographical location of rainforests. The commonest responses were continents or countries: Africa (given by 43% of children), South America (30%), Brazil (25%). Some children also gave more general locations, such as being near the Equator.",
  "Responses to question three concerned the importance of rainforests. The dominant idea, raised by 64% of the pupils, was that rainforests provide animals with habitats. Fewer students responded that rainforests provide plant habitats, and even fewer mentioned the indigenous populations of rainforests. More girls (70%) than boys (60%) raised the idea of rainforest as animal habitats.",
  "Similarly, but at a lower level, more girls (13%) than boys (5%) said that rainforests provided human habitats. These observations are generally consistent with our previous studies of pupils' views about the use and conservation of rainforests, in which girls were shown to be more sympathetic to animals and expressed views which seem to place an intrinsic value on non-human animal life.",
  "The fourth question concerned the causes of the destruction of rainforests. Perhaps encouragingly, more than half of the pupils (59%) identified that it is human activities which are destroying rainforests, some personalising the responsibility by the use of terms such as 'we are'. About 18% of the pupils referred specifically to logging activity. One misconception, expressed by some 10% of the pupils, was that acid rain is responsible for rainforest destruction; a similar proportion said that pollution is destroying rainforests. Here, children are confusing rainforest destruction with damage to the forests of Western Europe by these factors. While two fifths of the students provided the information that the rainforests provide oxygen, in some cases this response also embraced the misconception that rainforest destruction would reduce atmospheric oxygen, making the atmosphere incompatible with human life on Earth.",
  "In answer to the final question about the importance of rainforest conservation, the majority of children simply said that we need rainforests to survive. Only a few of the pupils (6%) mentioned that rainforest destruction may contribute to global warming. This is surprising considering the high level of media coverage on this issue. Some children expressed the idea that the conservation of rainforests is not important.",
  "The results of this study suggest that certain ideas predominate in the thinking of children about rainforests. Pupils' responses indicate some misconceptions in basic scientific knowledge of rainforests' ecosystems such as their ideas about rainforests as habitats for animals, plants and humans and the relationship between climatic change and destruction of rainforests.",
  "Pupils did not volunteer ideas that suggested that they appreciated the complexity of causes of rainforest destruction. In other words, they gave no indication of an appreciation of either the range of ways in which rainforests are important or the complex social, economic and political factors which drive the activities which are destroying the rainforests. One encouragement is that the results of similar studies about other environmental issues suggest that older children seem to acquire the ability to appreciate, value and evaluate conflicting views. Environmental education offers an arena in which these skills can be developed, which is essential for these children as future decision-makers.",
];

const readingPassage2Body = [
  "An examination of the functioning of the senses in cetaceans, the group of mammals comprising whales, dolphins and porpoises",
  "Some of the senses that we and other terrestrial mammals take for granted are either reduced or absent in cetaceans or fail to function well in water. For example, it appears from their brain structure that toothed species are unable to smell. Baleen species, on the other hand, appear to have some related brain structures but it is not known whether these are functional. It has been speculated that, as the blowholes evolved and migrated to the top of the head, the neural pathways serving sense of smell may have been nearly all sacrificed. Similarly, although at least some cetaceans have taste buds, the nerves serving these have degenerated or are rudimentary.",
  "The sense of touch has sometimes been described as weak too; but this view is probably mistaken. Trainers of captive dolphins and small whales often remark on their animals' responsiveness to being touched or rubbed, and both captive and free-ranging cetacean individuals of all species (particularly adults and calves, or members of the same subgroup) appear to make frequent contact. This contact may help to maintain order within a group, and stroking or touching are part of the courtship ritual in most species. The area around the blowhole is also particularly sensitive and captive animals often object strongly to being touched there.",
  "The sense of vision is developed to different degrees in different species. Baleen species studied at close quarters underwater - specifically a grey whale calf in captivity for a year, and free-ranging right whales and humpback whales studied and filmed off Argentina and Hawaii - have obviously tracked objects with vision underwater, and they can apparently see moderately well both in water and in air. However, the position of the eyes so restricts the field of vision in baleen whales that they probably do not have stereoscopic vision.",
  "On the other hand, the position of the eyes in most dolphins and porpoises suggests that they have stereoscopic vision forward and downward. Eye position in freshwater dolphins, which often swim on their side or upside down while feeding, suggests that what vision they have is stereoscopic forward and upward. By comparison, the bottlenose dolphin has extremely keen vision in water. Judging from the way it watches and tracks airborne flying fish, it can apparently see fairly well through the air-water interface as well. And although preliminary experimental evidence suggests that their in-air vision is poor, the accuracy with which dolphins leap high to take small fish out of a trainer's hand provides anecdotal evidence to the contrary.",
  "Such variation can no doubt be explained with reference to the habitats in which individual species have developed. For example, vision is obviously more useful to species inhabiting clear open waters than to those living in turbid rivers and flooded plains. The South American boutu and Chinese beiji, for instance, appear to have very limited vision, and the Indian susus are blind, their eyes reduced to slits that probably allow them to sense only the direction and intensity of light.",
  "Although the senses of taste and smell appear to have deteriorated, and vision in water appears to be uncertain, such weaknesses are more than compensated for by cetaceans' well-developed acoustic sense. Most species are highly vocal, although they vary in the range of sounds they produce, and many forage for food using echolocation. Large baleen whales primarily use the lower frequencies and are often limited in their repertoire. Notable exceptions are the nearly song-like choruses of bowhead whales in summer and the complex, haunting utterances of the humpback whales.",
  "Toothed species in general employ more of the frequency spectrum, and produce a wider variety of sounds, than baleen species (though the sperm whale apparently produces a monotonous series of high-energy clicks and little else). Some of the more complicated sounds are clearly communicative, although what role they may play in the social life and 'culture' of cetaceans has been more the subject of wild speculation than of solid science.",
  "echolocation: the perception of objects by means of sound wave echoes.",
];

const readingPassage3Body = [
  "Visual Symbols and the Blind",
  "Part 1",
  "From a number of recent studies, it has become clear that blind people can appreciate the use of outlines and perspectives to describe the arrangement of objects and other surfaces in space. But pictures are more than literal representations.",
  "This fact was drawn to my attention dramatically when a blind woman in one of my investigations decided on her own initiative to draw a wheel as it was spinning. To show this motion, she traced a curve inside the circle (Fig. 1). I was taken aback. Lines of motion, such as the one she used, are a very recent invention in the history of illustration. Indeed, as art scholar David Kunzle notes, Wilhelm Busch, a trend-setting nineteenth-century cartoonist, used virtually no motion lines in his popular figures until about 1877.",
  "When I asked several other blind study subjects to draw a spinning wheel, one particularly clever rendition appeared repeatedly: several subjects showed the wheel's spokes as curved lines. When asked about these curves, they all described them as metaphorical ways of suggesting motion. Majority rule would argue that this device somehow indicated motion very well. But was it a better indicator than, say, broken or wavy lines - or any other kind of line, for that matter? The answer was not clear. So I decided to test whether various lines of motion were apt ways of showing movement or if they were merely idiosyncratic marks. Moreover, I wanted to discover whether there were differences in how the blind and the sighted interpreted lines of motion.",
  "To search out these answers, I created raised-line drawings of five different wheels, depicting spokes with lines that curved, bent, waved, dashed and extended beyond the perimeter of the wheel. I then asked eighteen blind volunteers to feel the wheels and assign one of the following motions to each wheel: wobbling, spinning fast, spinning steadily, jerking or braking. My control group consisted of eighteen sighted undergraduates from the University of Toronto.",
  "All but one of the blind subjects assigned distinctive motions to each wheel. Most guessed that the curved spokes indicated that the wheel was spinning steadily; the wavy spokes, they thought, suggested that the wheel was wobbling; and the bent spokes were taken as a sign that the wheel was jerking. Subjects assumed that spokes extending beyond the wheel's perimeter signified that the wheel had its brakes on and that dashed spokes indicated the wheel was spinning quickly.",
  "In addition, the favoured description for the sighted was the favoured description for the blind in every instance. What is more, the consensus among the sighted was barely higher than that among the blind. Because motion devices are unfamiliar to the blind, the task I gave them involved some problem solving. Evidently, however, the blind not only figured out meanings for each line of motion, but as a group they generally came up with the same meaning at least as frequently as did sighted subjects.",
  "Part 2",
  "We have found that the blind understand other kinds of visual metaphors as well. One blind woman drew a picture of a child inside a heart - choosing that symbol, she said, to show that love surrounded the child. With Chang Hong Liu, a doctoral student from China, I have begun exploring how well blind people understand the symbolism behind shapes such as hearts that do not directly represent their meaning.",
  "We gave a list of twenty pairs of words to sighted subjects and asked them to pick from each pair the term that best related to a circle and the term that best related to a square. For example, we asked: What goes with soft? A circle or a square? Which shape goes with hard?",
  "All our subjects deemed the circle soft and the square hard. A full 94% ascribed happy to the circle, instead of sad. But other pairs revealed less agreement: 79% matched fast to slow and weak to strong, respectively. And only 51% linked deep to circle and shallow to square. (See Fig. 2.) When we tested four totally blind volunteers using the same list, we found that their choices closely resembled those made by the sighted subjects. One man, who had been blind since birth, scored extremely well. He made only one match differing from the consensus, assigning 'far' to square and 'near' to circle. In fact, only a small majority of sighted subjects - 53% - had paired far and near to the opposite partners. Thus, we concluded that the blind interpret abstract shapes as sighted people do.",
  "Fig. 2 data: SOFT-HARD 100; MOTHER-FATHER 94; HAPPY-SAD 94; GOOD-EVIL 89; LOVE-HATE 89; ALIVE-DEAD 87; BRIGHT-DARK 87; LIGHT-HEAVY 85; WARM-COLD 81; SUMMER-WINTER 81; WEAK-STRONG 79; FAST-SLOW 79; CAT-DOG 74; SPRING-FALL 74; QUIET-LOUD 62; WALKING-STANDING 62; ODD-EVEN 57; FAR-NEAR 53; PLANT-ANIMAL 53; DEEP-SHALLOW 51.",
];

const readingQuestions: Question[] = [
  ...[
    "The plight of the rainforests has largely been ignored by the media.",
    "Children only accept opinions on rainforests that they encounter in their classrooms.",
    "It has been suggested that children hold mistaken views about the 'pure' science that they study at school.",
    "The fact that children's ideas about science form part of a larger framework of ideas means that it is easier to change them.",
    "The study involved asking children a number of yes/no questions such as 'Are there any rainforests in Africa?'",
    "Girls are more likely than boys to hold mistaken views about the rainforests' destruction.",
    "The study reported here follows on from a series of studies that have looked at children's understanding of rainforests.",
    "A second study has been planned to investigate primary school children's ideas about rainforests.",
  ].map((prompt, index) => ({
    id: `rq${index + 1}`,
    number: index + 1,
    type: "true-false-not-given" as const,
    instruction:
      index === 0
        ? "Questions 1-8\nDo the following statements agree with the information given in Reading Passage 1?"
        : undefined,
    prompt,
    options: tfngOptions,
  })),
  ...[
    "What was the children's most frequent response when asked where the rainforests were?",
    "What was the most common response to the question about the importance of the rainforests?",
    "What did most children give as the reason for the loss of the rainforests?",
    "Why did most children think it important for the rainforests to be protected?",
    "Which response is cited as unexpectedly uncommon, given the amount of media coverage?",
  ].map((prompt, index) => ({
    id: `rq${index + 9}`,
    number: index + 9,
    type: "matching" as const,
    instruction:
      index === 0
        ? "Questions 9-13\nThe box below gives a list of responses A-P to the questionnaire discussed in Reading Passage 1. Answer the following questions by choosing the correct responses A-P.\n\nA There is a complicated combination of reasons for the loss of the rainforests.\nB The rainforests are being destroyed by the same things that are destroying the forests of Western Europe.\nC Rainforests are located near the Equator.\nD Brazil is home to the rainforests.\nE Without rainforests some animals would have nowhere to live.\nF Rainforests are important habitats for a lot of plants.\nG People are responsible for the loss of the rainforests.\nH The rainforests are a source of oxygen.\nI Rainforests are of consequence for a number of different reasons.\nJ As the rainforests are destroyed, the world gets warmer.\nK Without rainforests there would not be enough oxygen in the air.\nL There are people for whom the rainforests are home.\nM Rainforests are found in Africa.\nN Rainforests are not really important to human life.\nO The destruction of the rainforests is the direct result of logging activity.\nP Humans depend on the rainforests for their continuing existence."
        : undefined,
    prompt,
  })),
  {
    id: "rq14",
    number: 14,
    type: "single-choice",
    instruction: "Question 14\nChoose the correct letter, A, B, C, D or E.",
    prompt: "Which of the following is the most suitable title for Reading Passage 1?",
    options: choiceOptions([
      [
        "A",
        "The development of a programme in environmental studies within a science curriculum",
      ],
      [
        "B",
        "Children's ideas about the rainforests and the implications for course design",
      ],
      [
        "C",
        "The extent to which children have been misled by the media concerning the rainforests",
      ],
      [
        "D",
        "How to collect, collate and describe the ideas of secondary school children",
      ],
      [
        "E",
        "The importance of the rainforests and the reasons for their destruction",
      ],
    ]),
  },
  ...[
    "Taste: some types - nerves linked to their ______ are poorly developed.",
    "Vision: ______ - yes - probably do not have stereoscopic vision.",
    "Vision: dolphins, porpoises - yes - probably have stereoscopic vision ______ and ______.",
    "Vision: ______ - yes - probably have stereoscopic vision forward and upward.",
    "Vision: bottlenose dolphins - exceptional in ______ and good in air-water interface.",
    "Hearing: most large baleen - yes - usually use ______; repertoire limited.",
    "Hearing: ______ whales and ______ whales - song-like.",
  ].map((prompt, index) => ({
    id: `rq${index + 15}`,
    number: index + 15,
    type: "table-completion" as const,
    instruction:
      index === 0
        ? "Questions 15-21\nComplete the table. Choose NO MORE THAN THREE WORDS from Reading Passage 2 for each answer."
        : undefined,
    prompt,
  })),
  ...[
    "Which of the senses is described here as being involved in mating?",
    "Which species swims upside down while eating?",
    "What can bottlenose dolphins follow from under the water?",
    "Which type of habitat is related to good visual ability?",
    "Which of the senses is best developed in cetaceans?",
  ].map((prompt, index) => ({
    id: `rq${index + 22}`,
    number: index + 22,
    type: "short-answer" as const,
    instruction:
      index === 0
        ? "Questions 22-26\nAnswer using NO MORE THAN THREE WORDS from the passage."
        : undefined,
    prompt,
  })),
  ...[
    "In the first paragraph the writer makes the point that blind people",
    "The writer was surprised because the blind woman",
    "From the experiment described in Part 1, the writer found that the blind subjects",
  ].map((prompt, index) => ({
    id: `rq${index + 27}`,
    number: index + 27,
    type: "single-choice" as const,
    instruction:
      index === 0
        ? "Questions 27-29\nChoose the correct letter, A, B, C or D."
        : undefined,
    prompt,
    options:
      index === 0
        ? choiceOptions([
            ["A", "may be interested in studying art."],
            ["B", "can draw outlines of different objects and surfaces."],
            ["C", "can recognise conventions such as perspective."],
            ["D", "can draw accurately."],
          ])
        : index === 1
          ? choiceOptions([
              ["A", "drew a circle on her own initiative."],
              ["B", "did not understand what a wheel looked like."],
              ["C", "included a symbol representing movement."],
              ["D", "was the first person to use lines of motion."],
            ])
          : choiceOptions([
              [
                "A",
                "had good understanding of symbols representing movement.",
              ],
              [
                "B",
                "could control the movement of wheels very accurately.",
              ],
              [
                "C",
                "worked together well as a group in solving problems.",
              ],
              ["D", "got better results than the sighted undergraduates."],
            ]),
  })),
  ...["Diagram 30", "Diagram 31", "Diagram 32"].map((prompt, index) => ({
    id: `rq${index + 30}`,
    number: index + 30,
    type: "matching" as const,
    instruction:
      index === 0
        ? "Questions 30-32\nLook at the following diagrams (Questions 30-32), and the list of types of movement below.\n\nA steady spinning\nB jerky movement\nC rapid spinning\nD wobbling movement\nE use of brakes"
        : undefined,
    prompt,
    imageAssetIds: index === 0 ? ["movement-diagrams-q30-32"] : undefined,
  })),
  ...[
    "In the experiment described in Part 2, a set of word ______ was used to investigate whether blind and sighted people perceived the symbolism in abstract ______ in the same way.",
    "In the experiment described in Part 2, a set of word ______ was used to investigate whether blind and sighted people perceived the symbolism in abstract ______ in the same way.",
    "Subjects were asked which word fitted best with a circle and which with a square. From the ______ volunteers, everyone thought a circle fitted 'soft' while a square fitted 'hard'.",
    "However, only 51% of the ______ volunteers assigned a circle to ______.",
    "However, only 51% of the ______ volunteers assigned a circle to ______.",
    "When the test was later repeated with ______ volunteers, it was found that they made ______ choices.",
    "When the test was later repeated with ______ volunteers, it was found that they made ______ choices.",
  ].map((prompt, index) => ({
    id: `rq${index + 33}`,
    number: index + 33,
    type: "sentence-completion" as const,
    instruction:
      index === 0
        ? "Questions 33-39\nComplete the summary below using words from the box.\n\nassociations  blind  deep  hard  hundred  identical  pairs  shapes  sighted  similar  shallow  soft  words"
        : undefined,
    prompt,
  })),
  {
    id: "rq40",
    number: 40,
    type: "single-choice",
    instruction: "Question 40\nChoose the correct letter, A, B, C or D.",
    prompt:
      "Which of the following statements best summarises the writer's general conclusion?",
    options: choiceOptions([
      [
        "A",
        "The blind represent some aspects of reality differently from sighted people.",
      ],
      [
        "B",
        "The blind comprehend visual metaphors in similar ways to sighted people.",
      ],
      [
        "C",
        "The blind may create unusual and effective symbols to represent reality.",
      ],
      ["D", "The blind may be successful artists if given the right training."],
    ]),
  },
];

const listeningQuestions: Question[] = Array.from({ length: 40 }, (_, index) => {
  const number = index + 1;
  const sectionStart = number === 1 || number === 11 || number === 21 || number === 31;
  const sectionIndex = Math.floor((number - 1) / 10);

  return {
    id: `lq${number}`,
    number,
    type:
      number === 21 || number === 22
        ? ("single-choice" as const)
        : ("note-completion" as const),
    instruction:
      sectionStart
        ? test1ListeningPartTextsBySection[sectionIndex]
        : undefined,
    prompt: "",
    options: number === 21 || number === 22 ? abcOptions : undefined,
    imageAssetIds:
      number === 1
        ? ["test1-page-11", "test1-page-12"]
        : number === 11
          ? ["test1-page-13", "test1-page-14"]
          : number === 21
            ? ["test1-page-15", "test1-page-16", "test1-page-17"]
            : number === 31
              ? ["test1-page-18"]
              : undefined,
  } as Question;
});

const readingAnswerKey: AnswerKeyEntry[] = [
  ["rq1", 1, ["FALSE"]],
  ["rq2", 2, ["FALSE"]],
  ["rq3", 3, ["TRUE"]],
  ["rq4", 4, ["TRUE"]],
  ["rq5", 5, ["FALSE"]],
  ["rq6", 6, ["NOT GIVEN"]],
  ["rq7", 7, ["TRUE"]],
  ["rq8", 8, ["NOT GIVEN"]],
  ["rq9", 9, ["M"]],
  ["rq10", 10, ["E"]],
  ["rq11", 11, ["G"]],
  ["rq12", 12, ["P"]],
  ["rq13", 13, ["J"]],
  ["rq14", 14, ["B"]],
  ["rq15", 15, ["taste buds"]],
  ["rq16", 16, ["baleen", "the baleen whales"]],
  [
    "rq17",
    17,
    ["forward downward", "downward forward", "forward and downward", "downward and forward"],
  ],
  [
    "rq18",
    18,
    ["freshwater dolphin", "freshwater dolphins", "the freshwater dolphin", "the freshwater dolphins"],
  ],
  ["rq19", 19, ["water", "the water"]],
  ["rq20", 20, ["lower frequencies", "the lower frequencies"]],
  ["rq21", 21, ["bowhead humpback", "humpback bowhead", "bowhead and humpback", "humpback and bowhead"]],
  ["rq22", 22, ["touch", "sense of touch"]],
  [
    "rq23",
    23,
    ["freshwater dolphin", "freshwater dolphins", "the freshwater dolphin", "the freshwater dolphins"],
  ],
  ["rq24", 24, ["airborne flying fish"]],
  ["rq25", 25, ["clear water", "clear waters", "clear open water", "clear open waters"]],
  ["rq26", 26, ["acoustic sense", "the acoustic sense"]],
  ["rq27", 27, ["C"]],
  ["rq28", 28, ["C"]],
  ["rq29", 29, ["A"]],
  ["rq30", 30, ["E"]],
  ["rq31", 31, ["C"]],
  ["rq32", 32, ["A"]],
  ["rq33", 33, ["pairs"]],
  ["rq34", 34, ["shapes"]],
  ["rq35", 35, ["sighted"]],
  ["rq36", 36, ["sighted"]],
  ["rq37", 37, ["deep"]],
  ["rq38", 38, ["blind"]],
  ["rq39", 39, ["similar"]],
  ["rq40", 40, ["B"]],
].map(([id, number, answers]) =>
  answerKey(id as string, number as number, answers as string[]),
);

const listeningAnswerKey: AnswerKeyEntry[] = [
  ["lq1", 1, ["shopping", "variety of shopping"]],
  ["lq2", 2, ["guided tours"]],
  ["lq3", 3, ["more than 12", "over 12"]],
  ["lq4", 4, ["notice board"]],
  ["lq5", 5, ["13th February"]],
  ["lq6", 6, ["Tower of London"]],
  ["lq7", 7, ["Bristol"]],
  ["lq8", 8, ["American Museum"]],
  ["lq9", 9, ["student newspaper"]],
  ["lq10", 10, ["Yentob"]],
  ["lq11", 11, ["coal firewood", "firewood coal", "coal and firewood", "firewood and coal"]],
  ["lq12", 12, ["local craftsmen"]],
  ["lq13", 13, ["160"]],
  ["lq14", 14, ["Woodside"]],
  ["lq15", 15, ["Ticket Office"]],
  ["lq16", 16, ["Gift Shop"]],
  ["lq17", 17, ["Workshop", "main Workshop"]],
  ["lq18", 18, ["Showroom"]],
  ["lq19", 19, ["Cafe"]],
  ["lq20", 20, ["cottages"]],
  ["lq21", 21, ["A"]],
  ["lq22", 22, ["C"]],
  ["lq23", 23, ["E"]],
  ["lq24", 24, ["B"]],
  ["lq25", 25, ["G"]],
  ["lq26", 26, ["F"]],
  ["lq27", 27, ["C"]],
  ["lq28", 28, ["D"]],
  ["lq29", 29, ["A"]],
  ["lq30", 30, ["B"]],
  ["lq31", 31, ["cities", "environment"]],
  ["lq32", 32, ["windy"]],
  ["lq33", 33, ["humid"]],
  ["lq34", 34, ["shady", "shaded"]],
  ["lq35", 35, ["dangerous"]],
  ["lq36", 36, ["leaves"]],
  ["lq37", 37, ["ground"]],
  ["lq38", 38, ["considerably reduce", "decrease", "filter"]],
  ["lq39", 39, ["low"]],
  ["lq40", 40, ["space", "room"]],
].map(([id, number, answers]) =>
  answerKey(id as string, number as number, answers as string[]),
);

export const mockTest01: MockTest = {
  metadata: {
    id: "mock-test-01",
    slug: "cambridge-ielts-4-test-1",
    title: "Cambridge IELTS 4 - Test 1",
    testType: "academic",
    description:
      "Academic IELTS computer-delivered mock test using Cambridge IELTS 4 Test 1 material.",
    status: "published",
    modules: {
      listening: true,
      reading: true,
      writing: true,
    },
    version: 1,
    createdAt: "2026-08-31T00:00:00.000Z",
    updatedAt: "2026-08-31T00:00:00.000Z",
    sourceNotes: [
      "Source: Cambridge IELTS 4 PDF supplied by the user.",
      "Only Test 1 is implemented in V1 at this stage.",
      "Speaking is out of scope. Listening audio is matched by section file names.",
    ],
  },
  materials: {
    listening: {
      available: true,
      notes: [
        "Listening questions and answer key are loaded.",
        "Audio is matched by file name: mock-test-01-listening-section-1.mp3 through mock-test-01-listening-section-4.mp3.",
      ],
      missing: [],
    },
    reading: {
      available: true,
      notes: [
        "Academic Reading Test 1 has three passages and 40 questions.",
        "Reading passages are represented as text. Original images are used only for visual source material that needs image fidelity.",
      ],
      missing: [],
    },
    writing: {
      available: true,
      notes: ["Writing Task 1 and Task 2 are loaded."],
      missing: [],
    },
  },
  assets,
  listening: {
    durationSeconds: 40 * 60,
    parts: [
      {
        id: "listening-part-1",
        title: "SECTION 1 Questions 1-10",
        instruction: test1ListeningPartTextsBySection[0],
        audioAssetId: "test1-section-1-audio",
        imageAssetIds: ["test1-page-11", "test1-page-12"],
        questionIds: Array.from({ length: 10 }, (_, index) => `lq${index + 1}`),
      },
      {
        id: "listening-part-2",
        title: "SECTION 2 Questions 11-20",
        instruction: test1ListeningPartTextsBySection[1],
        audioAssetId: "test1-section-2-audio",
        imageAssetIds: ["test1-page-13", "test1-page-14"],
        questionIds: Array.from({ length: 10 }, (_, index) => `lq${index + 11}`),
      },
      {
        id: "listening-part-3",
        title: "SECTION 3 Questions 21-30",
        instruction: test1ListeningPartTextsBySection[2],
        audioAssetId: "test1-section-3-audio",
        imageAssetIds: ["test1-page-15", "test1-page-16", "test1-page-17"],
        questionIds: Array.from({ length: 10 }, (_, index) => `lq${index + 21}`),
      },
      {
        id: "listening-part-4",
        title: "SECTION 4 Questions 31-40",
        instruction: test1ListeningPartTextsBySection[3],
        audioAssetId: "test1-section-4-audio",
        imageAssetIds: ["test1-page-18"],
        questionIds: Array.from({ length: 10 }, (_, index) => `lq${index + 31}`),
      },
    ],
    questions: listeningQuestions,
    answerKey: listeningAnswerKey,
  },
  reading: {
    durationSeconds: 60 * 60,
    passages: [
      {
        id: "reading-passage-1",
        title: "READING PASSAGE 1",
        subtitle: "Questions 1-14",
        body: readingPassage1Body,
        questionIds: Array.from({ length: 14 }, (_, index) => `rq${index + 1}`),
      },
      {
        id: "reading-passage-2",
        title: "READING PASSAGE 2",
        subtitle: "Questions 15-26",
        body: readingPassage2Body,
        questionIds: Array.from({ length: 12 }, (_, index) => `rq${index + 15}`),
      },
      {
        id: "reading-passage-3",
        title: "READING PASSAGE 3",
        subtitle: "Questions 27-40",
        body: readingPassage3Body,
        imageAssetIds: ["visual-symbols-fig-1"],
        questionIds: Array.from({ length: 14 }, (_, index) => `rq${index + 27}`),
      },
    ],
    questions: readingQuestions,
    answerKey: readingAnswerKey,
  },
  writing: {
    durationSeconds: 60 * 60,
    task1: {
      id: "task1",
      title: "WRITING TASK 1",
      prompt:
        "You should spend about 20 minutes on this task.\n\nThe table below shows the proportion of different categories of families living in poverty in Australia in 1999.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      table: {
        columns: [
          "Family type",
          "Proportion of people from each household type living in poverty",
        ],
        rows: [
          ["single aged person", "6% (54,000)"],
          ["aged couple", "4% (48,000)"],
          ["single, no children", "19% (359,000)"],
          ["couple, no children", "7% (211,000)"],
          ["sole parent", "21% (232,000)"],
          ["couple with children", "12% (933,000)"],
          ["all households", "11% (1,837,000)"],
        ],
      },
      recommendedMinutes: 20,
    },
    task2: {
      id: "task2",
      title: "WRITING TASK 2",
      prompt:
        "You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nCompare the advantages and disadvantages of three of the following as media for communicating information. State which you consider to be the most effective.\n\n- comics\n- books\n- radio\n- television\n- film\n- theatre\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
      recommendedMinutes: 40,
    },
  },
};

export const mockTest01MaterialReport = {
  availableAssets: assets.map((asset) => asset.description),
  missingAssets: [],
  questionTypes: [
    "True / False / Not Given",
    "Matching",
    "Multiple Choice",
    "Table Completion",
    "Short Answer",
    "Summary Completion",
    "Listening Note/Table/Plan/Chart Completion",
  ],
  potentialProblems: [
    "Listening audio files are configured by section file name.",
    "Reading text has been extracted from the supplied PDF and should be proofread against the original scan before high-stakes use.",
    "Speaking content exists in the PDF but remains out of scope for V1.",
  ],
};
