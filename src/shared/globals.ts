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
  { document: "./README", section: "README", dim: "N/A", ref: "readme" },
  {
    document: "./STYLING",
    section: "Document Styling",
    dim: "N/A",
    ref: "styling",
  },
  {
    document: "./CONTRIBUTING",
    section: "How to Contribute",
    dim: "N/A",
    ref: "contributing",
  },
  { document: "TODPS2", section: "Tales of Destiny", dim: "2D", ref: "todps2" },
  {
    document: "TODPS2-C",
    section: "Tales of Destiny",
    dim: "2D",
    ref: "todps2-c",
  },
  {
    document: "TODPS2-B",
    section: "Tales of Destiny",
    dim: "2D",
    ref: "todps2-b",
  },
  { document: "TOL", section: "Tales of Legendia", dim: "2D", ref: "tol" },
  { document: "TOA", section: "Tales of Arise", dim: "3D", ref: "toa" },
  { document: "TOV", section: "Tales of Vesperia", dim: "3D", ref: "tov" },
  { document: "TOTA", section: "Tales of the Abyss", dim: "3D", ref: "tota" },
  { document: "TOX2", section: "Tales of Xillia 2", dim: "3D", ref: "tox2" },
  { document: "TOZ", section: "Tales of Zestiria", dim: "3D", ref: "toz" },
  { document: "HOME", section: "HOME", dim: "N/A", ref: "" },
];

export { fileList };
