import path from "path";
import DataUriParser from "datauri";


const getDataUrl = (file) => {
    const parser = new DataUriParser();

    const extName = path.extname(file.originalname).substring(1); // Remove leading "."

    return parser.format(extName, file.buffer);
};

export default getDataUrl;
