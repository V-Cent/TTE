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

  // Game files
  { document: "TOA", section: "Tales of Arise", dim: "3D", ref: "toa" },
  { document: "TOA-B", section: "Tales of Arise", dim: "3D", ref: "toa-b" },
  { document: "TOA-C", section: "Tales of Arise", dim: "3D", ref: "toa-c" },
  { document: "TODPS2", section: "Tales of Destiny", dim: "2D", ref: "todps2" },
  { document: "TODPS2-B", section: "Tales of Destiny", dim: "2D", ref: "todps2-b" },
  { document: "TODPS2-C", section: "Tales of Destiny", dim: "2D", ref: "todps2-c" },
  { document: "TOG", section: "Tales of Graces", dim: "3D", ref: "tog" },
  { document: "TOG-B", section: "Tales of Graces", dim: "3D", ref: "tog-b" },
  { document: "TOG-C", section: "Tales of Graces", dim: "3D", ref: "tog-c" },
  { document: "TOL", section: "Tales of Legendia", dim: "2D", ref: "tol" },
  { document: "TOL-B", section: "Tales of Legendia", dim: "2D", ref: "tol-b" },
  { document: "TOL-C", section: "Tales of Legendia", dim: "2D", ref: "tol-c" },
  { document: "TOS", section: "Tales of Symphonia", dim: "3D", ref: "tos" },
  { document: "TOS-B", section: "Tales of Symphonia", dim: "3D", ref: "tos-b" },
  { document: "TOS-C", section: "Tales of Symphonia", dim: "3D", ref: "tos-c" },
  { document: "TOTA", section: "Tales of the Abyss", dim: "3D", ref: "tota" },
  { document: "TOTA-B", section: "Tales of the Abyss", dim: "3D", ref: "tota-b" },
  { document: "TOTA-C", section: "Tales of the Abyss", dim: "3D", ref: "tota-c" },
  { document: "TOV", section: "Tales of Vesperia", dim: "3D", ref: "tov" },
  { document: "TOV-B", section: "Tales of Vesperia", dim: "3D", ref: "tov-b" },
  { document: "TOV-C", section: "Tales of Vesperia", dim: "3D", ref: "tov-c" },
  { document: "TOX", section: "Tales of Xillia", dim: "3D", ref: "tox" },
  { document: "TOX-B", section: "Tales of Xillia", dim: "3D", ref: "tox-b" },
  { document: "TOX-C", section: "Tales of Xillia", dim: "3D", ref: "tox-c" },
  { document: "TOX2", section: "Tales of Xillia 2", dim: "3D", ref: "tox2" },
  { document: "TOX2-B", section: "Tales of Xillia 2", dim: "3D", ref: "tox2-b" },
  { document: "TOX2-C", section: "Tales of Xillia 2", dim: "3D", ref: "tox2-c" },
  { document: "TOZ", section: "Tales of Zestiria", dim: "3D", ref: "toz" },
  { document: "TOZ-B", section: "Tales of Zestiria", dim: "3D", ref: "toz-b" },
  { document: "TOZ-C", section: "Tales of Zestiria", dim: "3D", ref: "toz-c" },
];

export { fileList };
