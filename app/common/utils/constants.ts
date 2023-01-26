export const labels = [
  "Design",
  "Testing",
  "Deployment",
  "Maintenance",
  "Feature",
  "Bug",
  "Chore",
  "Documentation",
  "Refactoring",
  "Research",
  "POC",
  "Frontend",
  "Backend",
  "Mobile",
  "Web",
  "API",
  "Database",
  "DevOps",
  "Security",
  "UX",
  "UI",
  "QA",
  "Good first issue",
  "Help wanted",
  "Blocking",
  "Production",
  "Staging",
  "Development",
  "Needs Discussion",
  "Needs Review",
];

export const monthMap = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "June",
  6: "July",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

export const Priority = {
  0: "no_priority",
  1: "low",
  2: "medium",
  3: "high",
  4: "urgent",
};

export const gasLimits = {
  "1": 30000000,
  "137": 30000000,
  "4": 30000000,
} as { [chainId: string]: number };

// export const kudosTypes = {
//   Kudos: [
//     { name: "headline", type: "string" },
//     { name: "description", type: "string" },
//     // { name: "communityUniqId", type: "string" },
//     //{ name: "communityId", type: "string" },
//     //{ name: "creator", type: "string" },
//     { name: "startDateTimestamp", type: "uint256" },
//     { name: "endDateTimestamp", type: "uint256" },
//     { name: "expirationTimestamp", type: "uint256" },
//     { name: "isSignatureRequired", type: "bool" },
//     { name: "isAllowlistRequired", type: "bool" },
//     { name: "links", type: "string[]" },
//     { name: "contributors", type: "string[]" },
//     { name: "nftTypeId", type: "string" },
//     // { name: "totalClaimCount", type: "int256" },
//   ],
// };

export const kudosTypes = {
  Kudos: [
    { name: "headline", type: "string" },
    { name: "description", type: "string" },
    { name: "startDateTimestamp", type: "uint256" },
    { name: "endDateTimestamp", type: "uint256" },
    { name: "links", type: "string[]" },
    { name: "communityUniqId", type: "string" },
    { name: "isSignatureRequired", type: "bool" },
    { name: "isAllowlistRequired", type: "bool" },
    { name: "totalClaimCount", type: "int256" },
    { name: "expirationTimestamp", type: "uint256" },
  ],
};

export const kudosTokenTypes = {
  Claim: [{ name: "tokenId", type: "uint256" }],
};

export const prevPropertyTypeToNewPropertyTypeThatDoesntRequiresClarance = {
  shortText: ["shortText", "longText"],
  longText: ["shortText", "longText"],
  number: ["number", "shortText", "longText"],
  ethAddress: ["ethAddress", "shortText", "longText"],
  email: ["email", "shortText", "longText"],
  singleURL: ["singleURL", "shortText", "longText"],
  date: ["date", "shortText", "longText"],
  singleSelect: ["singleSelect", "multiSelect"],
  multiSelect: ["multiSelect"],
  user: ["user", "user[]"],
  "user[]": ["user[]"],
  multiURL: ["multiURL"],
  reward: ["reward"],
  payWall: ["payWall"],
  milestone: ["milestone"],
};

export const opportunityType = [
  "Grant",
  "Circle Membership",
  "Full Time",
  "Part Time",
  "Contractual",
];

export const skills = [
  "None",
  "Design",
  "Development",
  "Marketing",
  "Business Development",
  "Community Management",
  "Legal",
  "Finance",
  "Operations",
  "Product Management",
  "Writing",
  "Translation",
];

export const experienceLevel = [
  "No Experience is fine",
  "Some Experience is Required",
  "High Level of Expertise is Required",
];

export const tags = {
  Design: [
    "Graphic Design",
    "UI/UX Design",
    "Web Design",
    "Logo Design",
    "Illustration",
    "Animation",
    "3D Modeling",
    "3D Animation",
    "3D Rendering",
    "Product Design",
    "Industrial Design",
    "Fashion Design",
    "Interior Design",
    "Architecture",
    "Game Design",
    "Game Art",
    "Game Animation",
    "Game Audio",
    "Figma",
    "Canve",
    "Sketch",
    "Adobe XD",
    "Adobe Photoshop",
    "Adobe Illustrator",
  ],
  Development: [
    "Web Development",
    "Mobile Development",
    "Desktop Development",
    "Game Development",
    "JavaScript",
    "TypeScript",
    "React",
    "React Native",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "Ruby on Rails",
    "Python",
    "Django",
    "Flask",
    "Java",
    "Spring",
    "Android",
    "iOS",
    "Swift",
    "Kotlin",
    "C#",
    "Unity",
    "Unreal Engine",
    "C++",
    "C",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Laravel",
    "WordPress",
    "Solidity",
  ],
  Marketing: [
    "Content Marketing",
    "Social Media Marketing",
    "Search Engine Optimization",
    "Search Engine Marketing",
    "Email Marketing",
    "Influencer Marketing",
    "Affiliate Marketing",
    "Growth Hacking",
    "Marketing Automation",
    "Marketing Strategy",
    "Marketing Analytics",
    "Marketing Research",
    "Marketing Planning",
    "Marketing Consulting",
    "Marketing Copywriting",
    "Marketing Design",
    "Marketing Video Production",
  ],
  "Business Development": [
    "Sales",
    "Management",
    "Development",
    "Planning",
    "Strategy",
    "Consulting",
    "Research",
  ],
  "Community Management": ["Community Building"],
  Legal: ["Legal Research"],
  Finance: ["Financial Analysis"],
  Operations: ["Operations Management"],
  "Product Management": ["Product Planning"],
  Writing: ["Content Writing"],
  Translation: ["Hindi"],
};

export const Scribes = {
  grants: {
    create:
      "https://scribehow.com/embed/Create_a_Grants_Workflow_on_Spect__Of7YjSwlRhW8ZiYbjgkO3g?skipIntro=true",
    using:
      "https://scribehow.com/embed/Using_the_Grants_Workflow_on_Spect__3wAVohzbQE-jucIYdf3nPw?skipIntro=true",
  },
  onboarding: {
    create:
      "https://scribehow.com/embed/Using_Onboarding_Workflow__7rbU0WKITSiftkuFBI0QAg?skipIntro=true",
    using:
      "https://scribehow.com/embed/Using_Onboarding_Workflow__7rbU0WKITSiftkuFBI0QAg?skipIntro=true",
  },
  kanban: {
    create:
      "https://scribehow.com/embed/Using_Kanban_Project__XSb29SqSTvSmbWGiH8AJjg?skipIntro=true",
    using:
      "https://scribehow.com/embed/Using_Kanban_Project__XSb29SqSTvSmbWGiH8AJjg?skipIntro=true",
  },
};
