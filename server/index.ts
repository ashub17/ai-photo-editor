import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Image Studio API listening on http://localhost:${port}`);
});
