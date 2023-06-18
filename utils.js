const fs = require("fs");

const formatSegmentsData = (segments) => {
  return segments.map((segment) => {
    const startText = `${String(Math.floor(segment.start / 60)).padStart(2, "0")}:${String(Math.floor(segment.start % 60)).padStart(2, "0")}`
    const endText = `${String(Math.floor(segment.end / 60)).padStart(2, "0")}:${String(Math.floor(segment.end % 60)).padStart(2, "0")}`
    return `${startText}~${endText}\n${segment.text}`
  }).join('\n\n')
}

const isAudioFile = (file) => {
  return file.toLowerCase().endsWith(".mp3");
};

const isMovieFile = (file) => {
  return file.toLowerCase().endsWith(".mp4");
};

// MBでファイルサイズを取得する関数
const getFileSizeInMB = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
  return fileSizeInMB;
}

module.exports = {
  formatSegmentsData,
  isAudioFile,
  isMovieFile,
  getFileSizeInMB,
};
