# Text Transcription Tool

会議やユーザーヒアリングの録画の内容を文字起こしするためのツールです。

## 使い方

## 1. 音声を用意する

まずは録画した動画を mp3 に変換を行います。Google meet の録画の場合は mp4 でダウンロードできるのでそのまま Whisper に投げることはできますが、容量上限が 25MB のため殆どの場合超過してしまいます。そのため ffmpeg を用いて圧縮された mp3 に変換する必要があります。

ffmpeg がまだインストールされていない場合は brew でインストールしてください
```
brew install ffmpeg
```

インストールができたら以下のコマンドを参考に 32kbps の音声に変換してください。
```
ffmpeg -i 動画.mp4 -f mp3 -b:a 32k 音声.mp3
```

## 2. 文字起こしツールに音声を渡す

初めて使用する場合は npm パッケージをインストールしてください。

```
npm install
```

npm パッケージがインストールされていたら以下のコマンドを参考に文字起こしを行ってください。OPENAI_API_KEYや出力先などはご自身で変えてください。

```
OPENAI_API_KEY=xxxxxxxxxxxxx node index.js -f 音声.mp3 > ~/Desktop/文字起こし.txt
```