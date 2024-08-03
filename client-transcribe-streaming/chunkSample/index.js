import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
  LanguageCode,
  MediaEncoding,
} from "@aws-sdk/client-transcribe-streaming";
import { PassThrough } from "stream";
import { createReadStream } from "fs";

const client = new TranscribeStreamingClient({ region: "us-west-2" });
const audioSource = createReadStream("./audio.wav");
const audioPayloadStream = new PassThrough({ highWaterMark: 1 * 1024 });
audioSource.pipe(audioPayloadStream);

const sampleRate = 48000; // sample rate of the audio stream
const chunkSize = (2 * sampleRate * 100) / 1000; // this is 100 ms https://docs.aws.amazon.com/transcribe/latest/dg/streaming.html#best-practices
const audioStream = async function* () {
  for await (const payloadChunk of audioPayloadStream) {
    let total_bytes_sent = 0;
    //chunk the audio to the given chunkSize
    if (payloadChunk.byteLength > chunkSize) {
      const result = [];
      const len = payloadChunk.length;
      let i = 0;

      while (i < len) {
        result.push(payloadChunk.slice(i, (i += chunkSize)));
      }

      let stream_start_time = Date.now();
      let wall_clock_time = 0;
      let audio_sent_time = 0;
      for (const chunk of result) {
        wall_clock_time = (Date.now() - stream_start_time) / 1000;
        total_bytes_sent += chunk.byteLength;
        audio_sent_time += chunk.byteLength / (2 * sampleRate);
        yield { AudioEvent: { AudioChunk: chunk } };
      }
    } else {
      wall_clock_time = (Date.now() - stream_start_time) / 1000;
      total_bytes_sent += chunk.byteLength;
      audio_sent_time += chunk.byteLength / (2 * sampleRate);
      yield { AudioEvent: { AudioChunk: payloadChunk } };
    }
    // console.log("total_bytes_sent: ", total_bytes_sent);

    await new Promise((r) =>
      setTimeout(r, total_bytes_sent / (2 * (sampleRate / 1000)))
    );
  }
};

const command = new StartStreamTranscriptionCommand({
  LanguageCode: LanguageCode.EN_US,
  MediaEncoding: MediaEncoding.PCM,
  MediaSampleRateHertz: sampleRate,
  AudioStream: audioStream(),
});

const response = await client.send(command);
console.log("result of client command: ", response.TranscriptResultStream);

let transcript;

for await (const event of response.TranscriptResultStream) {
  if (event.TranscriptEvent) {
    const message = event.TranscriptEvent;
    const results = event?.TranscriptEvent?.Transcript?.Results;
    //console.log("results", results);
    results.map((result) => {
      (result.Alternatives || []).map((alternative) => {
        transcript = alternative.Items.map((item) => item.Content).join(" ");
      });
    });
  }
}
console.log("transcript", transcript);
