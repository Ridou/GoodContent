import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

export const generateReactionVideo = async (videoUrl, audioUrl, text) => {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoUrl));
  ffmpeg.FS('writeFile', 'input.mp3', await fetchFile(audioUrl));

  await ffmpeg.run('-i', 'input.mp4', '-i', 'input.mp3', '-c:v', 'copy', '-c:a', 'aac', 'output.mp4');
  const data = ffmpeg.FS('readFile', 'output.mp4');

  return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
};
