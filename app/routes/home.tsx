import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ffmpeg = createFFmpeg({ log: true });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setVideoFile(file);

      // Load ffmpeg.js
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      // Write the video file to the ffmpeg file system
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));

      // Run the ffmpeg command to extract audio
      await ffmpeg.run('-i', 'input.mp4', 'output.mp3');

      // Read the output file from the ffmpeg file system
      const data = ffmpeg.FS('readFile', 'output.mp3');

      // Create a URL for the audio file
      const audioBlob = new Blob([data.buffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      setAudioProgress(100);
    }
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    setCurrentTime(time);
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  useEffect(() => {
    if (videoFile) {
      const videoElement = videoRef.current;
      if (videoElement) {
        const url = URL.createObjectURL(videoFile);
        videoElement.src = url;
        videoElement.onloadedmetadata = () => {
          setVideoDuration(videoElement.duration);
        };
        videoElement.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const context = canvas.getContext("2d");
          if (context) {
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            setVideoThumbnail(canvas.toDataURL("image/png"));
          }
        };
      }
    }
  }, [videoFile]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      {videoFile && <p>Selected file: {videoFile.name}</p>}
      {videoFile && (
        <input
          type="range"
          min="0"
          max={videoDuration}
          step="0.1"
          value={currentTime}
          onChange={handleSliderChange}
        />
      )}
      {videoThumbnail && (
        <img
          src={videoThumbnail}
          alt="Video thumbnail"
          style={{ maxHeight: "20vh" }}
        />
      )}
      <br/>
      {audioProgress > 0 && audioProgress < 100 && (
        <progress value={audioProgress} max="100">{audioProgress}%</progress>
      )}
      {audioUrl && (
        <>
          <a href={audioUrl} download="audio.mp3">
            Download Audio
          </a>
          <button onClick={handlePlayAudio}>Play Audio</button>
          <audio ref={audioRef} src={audioUrl} />
        </>
      )}
      <video ref={videoRef} style={{ display: "none" }} />
    </div>
  );
}
