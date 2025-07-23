// ---------
// Add new documents here!!
//  document: name of the file. ./ for files not in the tech folder
//  section: full name of the document
//  dim: 2D game, 3D game, or N/A
//  ref: same as document, but without path modifications and in lower-case

export interface FileEntry {
  document: string;
  section: string;
  dim: string;
  ref: string;
  platform?: string[];
  description?: string;
  initialRelease?: number;
}

const fileList: FileEntry[] = [
  // Utility files
  {
    document: "./CONTRIBUTING",
    section: "How to Contribute",
    dim: "N/A",
    ref: "contributing",
  },
  { document: "HOME", section: "HOME", dim: "N/A", ref: "" },
  { document: "./README", section: "README", dim: "N/A", ref: "readme" },
  {
    document: "./STYLING",
    section: "Document Styling",
    dim: "N/A",
    ref: "styling",
  },

  // Game files (these can be ordered by release later)
  {
    document: "TOG",
    section: "Tales of Graces",
    dim: "3D",
    ref: "tog",
    platform: ["Wii", "PS3", "Switch", "PS4", "PS5", "XB1", "XBS", "PC"],
    initialRelease: 2009,
    description: "Bonds Transcend Time",
  },
  { document: "TOG-B", section: "Tales of Graces", dim: "3D", ref: "tog-b" },
  { document: "TOG-C", section: "Tales of Graces", dim: "3D", ref: "tog-c" },
  {
    document: "TOA",
    section: "Tales of Arise",
    dim: "3D",
    ref: "toa",
    platform: ["PS4", "PS5", "XB1", "XBS", "PC"],
    initialRelease: 2021,
    description: "Challenge the Fate That Binds You",
  },
  { document: "TOA-B", section: "Tales of Arise", dim: "3D", ref: "toa-b" },
  { document: "TOA-C", section: "Tales of Arise", dim: "3D", ref: "toa-c" },
  {
    document: "TOV",
    section: "Tales of Vesperia",
    dim: "3D",
    ref: "tov",
    platform: ["360", "PS3", "Switch", "PS4", "PS5", "XB1", "XBS", "PC"],
    initialRelease: 2008,
    description: "To Each, Their Own Justice",
  },
  { document: "TOV-B", section: "Tales of Vesperia", dim: "3D", ref: "tov-b" },
  { document: "TOV-C", section: "Tales of Vesperia", dim: "3D", ref: "tov-c" },
  {
    document: "TODPS2",
    section: "Tales of Destiny",
    dim: "2D",
    ref: "todps2",
    platform: ["PS2"],
    initialRelease: 2006,
    description: "Liberate Your Destiny",
  },
  { document: "TODPS2-B", section: "Tales of Destiny", dim: "2D", ref: "todps2-b" },
  { document: "TODPS2-C", section: "Tales of Destiny", dim: "2D", ref: "todps2-c" },
  {
    document: "TOL",
    section: "Tales of Legendia",
    dim: "2D",
    ref: "tol",
    platform: ["PS2"],
    initialRelease: 2005,
    description: "Let Your Faith Give Birth to Power",
  },
  { document: "TOL-B", section: "Tales of Legendia", dim: "2D", ref: "tol-b" },
  { document: "TOL-C", section: "Tales of Legendia", dim: "2D", ref: "tol-c" },
  {
    document: "TOS",
    section: "Tales of Symphonia",
    dim: "3D",
    ref: "tos",
    platform: ["GCN", "PS2", "PS3", "PC", "Switch", "PS4", "XB1"],
    initialRelease: 2003,
    description: "The Epic Battle for Survival",
  },
  { document: "TOS-B", section: "Tales of Symphonia", dim: "3D", ref: "tos-b" },
  { document: "TOS-C", section: "Tales of Symphonia", dim: "3D", ref: "tos-c" },
  {
    document: "TOTA",
    section: "Tales of the Abyss",
    dim: "3D",
    ref: "tota",
    platform: ["PS2", "3DS"],
    initialRelease: 2005,
    description: "Learning Why One Exists",
  },
  { document: "TOTA-B", section: "Tales of the Abyss", dim: "3D", ref: "tota-b" },
  { document: "TOTA-C", section: "Tales of the Abyss", dim: "3D", ref: "tota-c" },
  {
    document: "TOX",
    section: "Tales of Xillia",
    dim: "3D",
    ref: "tox",
    platform: ["PS3"],
    initialRelease: 2011,
    description: "When Worlds Overlap, Belief Lights the Way",
  },
  { document: "TOX-B", section: "Tales of Xillia", dim: "3D", ref: "tox-b" },
  { document: "TOX-C", section: "Tales of Xillia", dim: "3D", ref: "tox-c" },
  {
    document: "TOX2",
    section: "Tales of Xillia 2",
    dim: "3D",
    ref: "tox2",
    platform: ["PS3"],
    initialRelease: 2012,
    description: "The Power of Choice",
  },
  { document: "TOX2-B", section: "Tales of Xillia 2", dim: "3D", ref: "tox2-b" },
  { document: "TOX2-C", section: "Tales of Xillia 2", dim: "3D", ref: "tox2-c" },
  {
    document: "TOZ",
    section: "Tales of Zestiria",
    dim: "3D",
    ref: "toz",
    platform: ["PS3", "PS4", "PC"],
    initialRelease: 2015,
    description: "Legends Beget Hope",
  },
  { document: "TOZ-B", section: "Tales of Zestiria", dim: "3D", ref: "toz-b" },
  { document: "TOZ-C", section: "Tales of Zestiria", dim: "3D", ref: "toz-c" },
];

export { fileList };
