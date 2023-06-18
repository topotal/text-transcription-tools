const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const program = require("commander");
const ffmpeg = require("fluent-ffmpeg");
const tmp = require("tmp");

const formatSegmentsData = (segments) => {
  return segments.map((segment) => {
    const startText = `${String(Math.floor(segment.start / 60)).padStart(2, "0")}:${String(Math.floor(segment.start % 60)).padStart(2, "0")}`
    const endText = `${String(Math.floor(segment.end / 60)).padStart(2, "0")}:${String(Math.floor(segment.end % 60)).padStart(2, "0")}`
    return `${startText}~${endText}\n${segment.text}`
  }).join('\n\n')
}

// CLI引数をパース
program.option("-f, --file <path>", "Path to MP3 file or MP4 file");
program.option("-o, --out <path>", "Path to output");
program.parse(process.argv);

const options = program.opts();
if (!options.file) {
  console.error("Missing required argument: -f/--file");
  process.exit(1);
} else if (
  !options.file.toLowerCase().endsWith(".mp3") &&
  !options.file.toLowerCase().endsWith(".mp4")
) {
  console.error("Invalid file");
  process.exit(1);
}

const isAudioFile = (file) => {
  return file.toLowerCase().endsWith(".mp3");
};

const isMovieFile = (file) => {
  return file.toLowerCase().endsWith(".mp4");
};

// 動画ファイルを音声ファイルに変換する関数
const audioBitrate = '32k'
const convertMovieToAudio = async (inputFilePath, outputFilePath) => {
  return new Promise((resolve) => {
    try {
      ffmpeg(inputFilePath)
        .audioBitrate(audioBitrate)
        .on('end', () => { resolve(outputFilePath) })
        .save(outputFilePath)
    } catch (error) {
      console.error(error instanceof Error ? error.message : "動画ファイルの変換に失敗しました")
      process.exit(1);
    }
  })
};

// MBでファイルサイズを取得する関数
const getFileSizeInMB = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
  return fileSizeInMB;
}

// MP3ファイルを文字起こしする関数
const transcribe = async (file) => {
  // ファイルサイズが 24MB 以上であればエラー
  if (getFileSizeInMB(file) > 24) {
    console.error("音声ファイルのサイズが大きすぎます。24MB以下のファイルを指定してください。");
    process.exit(1);
  }

  const form = new FormData();
  form.append("model", "whisper-1");
  form.append("file", fs.createReadStream(file));
  form.append("response_format", "verbose_json");
  // whisper APIのリクエスト実行
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
  return transcriptionResult;
}

(async () => {
  // 音声ファイルの場合はそのまま文字起こし
  if (isAudioFile(options.file)) {
    const result = await transcribe(options.file);
    console.info(formatSegmentsData(result.segments))
    process.exit(0);
  }
  // 動画ファイルの場合は音声ファイルに変換してから文字起こし
  else if (isMovieFile(options.file)) {
    const outputFileObj = tmp.fileSync({ postfix: '.mp3' });
    const audioFilePath = await convertMovieToAudio(options.file, outputFileObj.name);
    const result = await transcribe(audioFilePath);
    console.info(formatSegmentsData(result.segments))
    process.exit(0);
  }
  // それ以外の場合はエラー
  else {
    console.error("ファイルの形式が不正です。mp3 または mp4 ファイルを指定してください。");
    process.exit(1);
  }
})();
