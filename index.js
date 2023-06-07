const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const program = require("commander");

const formatSegmentsData = (segments) => {
  return segments.map((segment) => {
    const startText = `${String(Math.floor(segment.start / 60)).padStart(2, "0")}:${String(Math.floor(segment.start % 60)).padStart(2, "0")}`
    const endText = `${String(Math.floor(segment.end / 60)).padStart(2, "0")}:${String(Math.floor(segment.end % 60)).padStart(2, "0")}`
    return `${startText}~${endText}\n${segment.text}`
  }).join('\n\n')
}

// CLI引数をパース
program.option("-f, --file <path>", "Path to MP3 file");
program.parse(process.argv);

const options = program.opts();
if (!options.file) {
  console.error("Missing required argument: -f/--file");
  process.exit(1);
} else if (!options.file.toLowerCase().endsWith(".mp3")) {
  console.error("Invalid file");
  process.exit(1);
}

(async () => {
  // whisper APIのリクエスト実行
  const form = new FormData();
  form.append("model", "whisper-1");
  form.append("file", fs.createReadStream(options.file));
  form.append("response_format", "verbose_json");
  try {
    const transcriptionResult = await axios
      .post("https://api.openai.com/v1/audio/transcriptions", form, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      })
      .then((response) => response.data);

    // 結果出力
    console.log(formatSegmentsData(transcriptionResult.segments));
  } catch (error) {
    console.info(error)
    console.log(error.response.data);
    process.exit(1);
  }
})();
