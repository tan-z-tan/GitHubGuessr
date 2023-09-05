import { NextApiRequest, NextApiResponse } from "next";
import { QuestionData } from "../../types";

export default (req: NextApiRequest, res: NextApiResponse) => {
  const questionData: QuestionData = {
    repository: {
      id: "https://github.com/nodejs/node",
      org: "nodejs",
      name: "node",
      url: "https://github.com/nodejs/node",
      lang: "javascript",
      star_num: 0,
      folk_num: 0,
    },
    codeSnippets: [
      {
        id: 1,
        repository_id: "https://github.com/nodejs/node",
        lang: "javascript",
        code: '#include "node.h"\n#include "node_dotenv.h"',
      },
    ],
  };

  res.status(200).json(questionData);
};
