import { Innertube } from "youtubei.js";

type TranscriptSegment = {
  text: string ;
  start_ms: number;
  end_ms: number;
};

type TranscriptChunk = {
  text: string;
  start_ms: number;
  end_ms: number;
};

type GetTranscriptOptions = {
  chunkSize?: number;
  chunkBySilence?: boolean;
  silenceThreshold?: number;
};

/**
 * A service for fetching YouTube video transcripts
 */
export class YoutubeService {
  private static getVideoId(url: string): string | null {
    // Look for youtube.com/watch?v=VIDEO_ID
    let match = url.match(/[?&]v=([^&]+)/);
    if (match) {
      return match[1];
    }
    // Look for youtu.be/VIDEO_ID
    match = url.match(/youtu.be\/([^?]+)/);
    if (match) {
      return match[1];
    }
    return null;
  }

  /**
   * Get the transcript of a YouTube video
   * @param videoUrl The URL of the YouTube video
   * @param options Options for chunking the transcript
   * @returns The transcript of the video
   */
  public static async getTranscript(
    videoUrl: string,
    options: GetTranscriptOptions = {}
  ): Promise<TranscriptChunk[]> {
    try {
      const videoId = this.getVideoId(videoUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      const youtube = await Innertube.create();
      const info = await youtube.getInfo(videoId);

      if (!info.captions || info.captions.caption_tracks?.length === 0) {
        throw new Error("No caption tracks found for this video.");
      }

      const _transcript = await info.getTranscript();
      const segments: TranscriptSegment[] =
        _transcript.transcript.content?.body?.initial_segments?.map(
          ({ snippet, start_ms, end_ms }) => ({
            text: snippet?.text || "",
            start_ms: Number(start_ms),
            end_ms: Number(end_ms),
          })
        ) || [];

      if (options.chunkBySilence) {
        return this.chunkSegmentsBySilence(segments, options.silenceThreshold);
      }

      if (options.chunkSize) {
        return this.chunkSegments(segments, options.chunkSize);
      }

      return segments.map(({ text, start_ms, end_ms }) => ({
        text,
        start_ms,
        end_ms,
      }));
    } catch (error) {

      console.log("🚀ԅ(≖⌣≖ԅ) ~ YoutubeService ~ error => ", error)

      

      console.error("Failed to fetch transcript:", error);
      throw new Error("Failed to fetch transcript");
    }
  }

  private static chunkSegments(
    segments: TranscriptSegment[],
    chunkSize: number
  ): TranscriptChunk[] {
    const chunks: TranscriptChunk[] = [];
    let currentChunk: TranscriptChunk = {
      text: "",
      start_ms: 0,
      end_ms: 0,
    };

    for (const segment of segments) {
      if (currentChunk.text.length + segment.text.length > chunkSize) {
        chunks.push(currentChunk);
        currentChunk = {
          text: "",
          start_ms: segment.start_ms,
          end_ms: 0,
        };
      }

      if (currentChunk.text.length === 0) {
        currentChunk.start_ms = segment.start_ms;
      }

      currentChunk.text += segment.text + " ";
      currentChunk.end_ms = segment.end_ms;
    }

    if (currentChunk.text.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  private static chunkSegmentsBySilence(
    segments: TranscriptSegment[],
    silenceThreshold: number = 200
  ): TranscriptChunk[] {
    const chunks: TranscriptChunk[] = [];
    let currentChunk: TranscriptChunk = {
      text: "",
      start_ms: 0,
      end_ms: 0,
    };

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (currentChunk.text.length === 0) {
        currentChunk.start_ms = segment.start_ms;
      }

      currentChunk.text += segment.text + " ";
      currentChunk.end_ms = segment.end_ms;

      const nextSegment = segments[i + 1];
      if (nextSegment) {
        const silenceDuration = nextSegment.start_ms - segment.end_ms;
        if (silenceDuration > silenceThreshold) {
          chunks.push(currentChunk);
          currentChunk = {
            text: "",
            start_ms: 0,
            end_ms: 0,
          };
        }
      }
    }

    if (currentChunk.text.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }
}