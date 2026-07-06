import Foundation
import AVFoundation

/// All app sounds are synthesized at runtime with AVFoundation — nothing is
/// downloaded and no copyrighted audio is bundled. Each event renders a small
/// PCM buffer (sine + one harmonic, soft attack, exponential decay) and plays
/// it through an AVAudioEngine.
final class SoundSynth {

    static let shared = SoundSynth()

    /// 0 = mute; mirrors the parent "sound volume" setting.
    var volume: Double = 1.0

    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()
    private let sampleRate: Double = 44_100
    private var ready = false

    private init() {
        try? AVAudioSession.sharedInstance().setCategory(.ambient, options: [.mixWithOthers])
        try? AVAudioSession.sharedInstance().setActive(true)
        let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!
        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: format)
        do {
            try engine.start()
            player.play()
            ready = true
        } catch {
            ready = false
        }
    }

    // MARK: Notes

    struct Note {
        var freq: Double
        var start: TimeInterval
        var duration: TimeInterval
        var gain: Double = 0.4
    }

    /// MIDI note → frequency.
    private static func f(_ midi: Int) -> Double {
        440.0 * pow(2.0, Double(midi - 69) / 12.0)
    }

    private func play(_ notes: [Note]) {
        guard ready, volume > 0.001, !notes.isEmpty else { return }
        let total = notes.map { $0.start + $0.duration }.max()! + 0.05
        let frameCount = AVAudioFrameCount(total * sampleRate)
        let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return }
        buffer.frameLength = frameCount
        guard let data = buffer.floatChannelData?[0] else { return }
        for i in 0..<Int(frameCount) { data[i] = 0 }

        for note in notes {
            let startFrame = Int(note.start * sampleRate)
            let noteFrames = Int(note.duration * sampleRate)
            for i in 0..<noteFrames where startFrame + i < Int(frameCount) {
                let t = Double(i) / sampleRate
                let attack = min(1.0, t / 0.012)
                let envelope = attack * exp(-4.0 * t / note.duration)
                let sample = sin(2 * .pi * note.freq * t) + 0.25 * sin(4 * .pi * note.freq * t)
                data[startFrame + i] += Float(sample * envelope * note.gain * volume)
            }
        }
        // Soft clip so overlapping notes never crackle.
        for i in 0..<Int(frameCount) { data[i] = tanhf(data[i]) }
        player.scheduleBuffer(buffer, at: nil, options: [], completionHandler: nil)
    }

    private func sequence(midi: [Int], step: TimeInterval, duration: TimeInterval, gain: Double = 0.4) -> [Note] {
        midi.enumerated().map { i, m in
            Note(freq: Self.f(m), start: Double(i) * step, duration: duration, gain: gain)
        }
    }

    // MARK: Events

    /// Short cheerful ascending sparkle (per correct answer).
    func playCorrect() {
        play(sequence(midi: [84, 88, 91], step: 0.085, duration: 0.22, gain: 0.42))
    }

    /// Gentle, non-scary "try again" sound.
    func playGentleWrong() {
        play([
            Note(freq: Self.f(67), start: 0, duration: 0.22, gain: 0.18),
            Note(freq: Self.f(64), start: 0.16, duration: 0.30, gain: 0.16),
        ])
    }

    /// Satisfying coin "ding".
    func playCoin() {
        play([
            Note(freq: Self.f(83), start: 0, duration: 0.09, gain: 0.4),
            Note(freq: Self.f(88), start: 0.08, duration: 0.55, gain: 0.45),
        ])
    }

    /// Milestone fanfare — longer and richer with each escalation tier (1…5),
    /// clearly distinct from the per-problem chime.
    func playFanfare(tier: Int) {
        let t = min(max(tier, 1), 5)
        var midi: [Int] = [72, 76, 79, 84]                    // C E G C — the base fanfare
        if t >= 2 { midi += [83, 84] }
        if t >= 3 { midi += [86, 88] }
        if t >= 4 { midi += [91, 88, 91] }
        if t >= 5 { midi += [93, 96, 96] }
        var notes = sequence(midi: midi, step: 0.13, duration: 0.32, gain: 0.42)
        // Closing chord, bigger with tier.
        let chordStart = Double(midi.count) * 0.13 + 0.05
        for (i, m) in [72, 76, 79, 84].prefix(1 + t).enumerated() {
            notes.append(Note(freq: Self.f(m), start: chordStart + Double(i) * 0.01,
                              duration: 0.7 + Double(t) * 0.12, gain: 0.3))
        }
        play(notes)
    }

    /// Trophy upgrade — rising glissando plus a triumphant chord.
    func playTrophy() {
        var notes = sequence(midi: [60, 64, 67, 72, 76, 79, 84], step: 0.07, duration: 0.18, gain: 0.35)
        for (i, m) in [72, 76, 79, 84, 88].enumerated() {
            notes.append(Note(freq: Self.f(m), start: 0.6 + Double(i) * 0.012, duration: 1.0, gain: 0.28))
        }
        play(notes)
    }

    /// Kind "good night" jingle for the daily time limit.
    func playSleepy() {
        play([
            Note(freq: Self.f(79), start: 0.0, duration: 0.5, gain: 0.22),
            Note(freq: Self.f(76), start: 0.4, duration: 0.5, gain: 0.20),
            Note(freq: Self.f(72), start: 0.8, duration: 0.9, gain: 0.18),
        ])
    }
}
