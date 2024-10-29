import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "kyc-data.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { data } = req.body;

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      res.status(200).json({ message: "Data saved successfully!" });
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(500)
          .json({ message: "Error saving data", error: error.message });
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  } else if (req.method === "GET") {
    try {
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf8");
        res.status(200).json(JSON.parse(fileData));
      } else {
        res.status(404).json({ message: "File not found" });
      }
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(500)
          .json({ message: "Error reading file", error: error.message });
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
