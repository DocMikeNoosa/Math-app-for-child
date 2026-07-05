import SwiftUI
import SwiftData
import PDFKit
import UIKit

// MARK: - PDF generation

struct CertificateStats {
    var solved: Int
    var accuracy: Double
    var coins: Int
}

/// Draws a fridge-worthy diploma as a PDF (A4), with a decorative border,
/// laurels and stars — all drawn in code, no assets.
enum CertificateGenerator {

    static func makePDF(
        childName: String,
        language: AppLanguage,
        stats: CertificateStats?,
        date: Date
    ) -> URL? {
        let pageRect = CGRect(x: 0, y: 0, width: 595, height: 842) // A4 in points
        let renderer = UIGraphicsPDFRenderer(bounds: pageRect)

        let data = renderer.pdfData { ctx in
            ctx.beginPage()
            let cg = ctx.cgContext

            // Soft background
            cg.setFillColor(UIColor(red: 1.0, green: 0.98, blue: 0.94, alpha: 1).cgColor)
            cg.fill(pageRect)

            // Double decorative border
            let gold = UIColor(red: 0.85, green: 0.65, blue: 0.13, alpha: 1)
            let purple = UIColor(red: 0.55, green: 0.38, blue: 0.85, alpha: 1)
            let outer = pageRect.insetBy(dx: 24, dy: 24)
            let inner = pageRect.insetBy(dx: 38, dy: 38)
            cg.setStrokeColor(gold.cgColor)
            cg.setLineWidth(5)
            cg.addPath(UIBezierPath(roundedRect: outer, cornerRadius: 18).cgPath)
            cg.strokePath()
            cg.setStrokeColor(purple.cgColor)
            cg.setLineWidth(2)
            cg.addPath(UIBezierPath(roundedRect: inner, cornerRadius: 14).cgPath)
            cg.strokePath()

            // Corner stars
            for (x, y) in [(46.0, 46.0), (549.0, 46.0), (46.0, 796.0), (549.0, 796.0)] {
                draw(text: "⭐", font: .systemFont(ofSize: 26),
                     color: gold, center: CGPoint(x: x, y: y))
            }

            let pl = language == .pl
            var y: CGFloat = 90

            draw(text: "🌿  🏆  🌿", font: .systemFont(ofSize: 42), color: gold,
                 center: CGPoint(x: pageRect.midX, y: y + 20))
            y += 70

            draw(text: pl ? "DYPLOM" : "DIPLOMA",
                 font: rounded(52, weight: .heavy), color: purple,
                 center: CGPoint(x: pageRect.midX, y: y + 26))
            y += 66

            draw(text: pl ? "Mistrza Matematyki" : "Master of Mathematics",
                 font: rounded(30, weight: .bold), color: gold,
                 center: CGPoint(x: pageRect.midX, y: y + 15))
            y += 56

            draw(text: pl ? "dla" : "awarded to",
                 font: rounded(18, weight: .medium), color: .darkGray,
                 center: CGPoint(x: pageRect.midX, y: y + 9))
            y += 40

            draw(text: childName,
                 font: rounded(46, weight: .heavy),
                 color: UIColor(red: 1.0, green: 0.42, blue: 0.61, alpha: 1),
                 center: CGPoint(x: pageRect.midX, y: y + 23))
            y += 74

            let body = pl
                ? "za wspaniałe wyniki przekraczające\nwszelkie oczekiwania!"
                : "for wonderful results exceeding\nall expectations!"
            draw(text: body, font: rounded(20, weight: .semibold), color: .darkGray,
                 center: CGPoint(x: pageRect.midX, y: y + 26))
            y += 80

            if let stats {
                let lines = pl
                    ? ["✅  \(stats.solved) rozwiązanych zadań!",
                       String(format: "🎯  Skuteczność: %.0f%%", stats.accuracy * 100),
                       "🪙  \(stats.coins) zdobytych złotych monet!"]
                    : ["✅  \(stats.solved) problems solved!",
                       String(format: "🎯  Accuracy: %.0f%%", stats.accuracy * 100),
                       "🪙  \(stats.coins) gold coins collected!"]
                for line in lines {
                    draw(text: line, font: rounded(18, weight: .semibold), color: purple,
                         center: CGPoint(x: pageRect.midX, y: y + 12))
                    y += 34
                }
                y += 10
            }

            draw(text: "⭐ 🌟 ⭐ 🌟 ⭐", font: .systemFont(ofSize: 24), color: gold,
                 center: CGPoint(x: pageRect.midX, y: y + 16))

            // Date and signature line
            let formatter = DateFormatter()
            formatter.locale = Locale(identifier: pl ? "pl_PL" : "en_US")
            formatter.dateStyle = .long
            draw(text: formatter.string(from: date),
                 font: rounded(16, weight: .medium), color: .darkGray,
                 center: CGPoint(x: pageRect.midX, y: 726))
            draw(text: pl ? "Matematyka Tosi 🧮" : "Tosia's Math 🧮",
                 font: rounded(14, weight: .semibold), color: purple,
                 center: CGPoint(x: pageRect.midX, y: 756))
        }

        let name = language == .pl ? "Dyplom-\(childName).pdf" : "Diploma-\(childName).pdf"
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent(name.replacingOccurrences(of: " ", with: "-"))
        do {
            try data.write(to: url)
            return url
        } catch {
            return nil
        }
    }

    private static func rounded(_ size: CGFloat, weight: UIFont.Weight) -> UIFont {
        let base = UIFont.systemFont(ofSize: size, weight: weight)
        guard let descriptor = base.fontDescriptor.withDesign(.rounded) else { return base }
        return UIFont(descriptor: descriptor, size: size)
    }

    private static func draw(text: String, font: UIFont, color: UIColor, center: CGPoint) {
        let paragraph = NSMutableParagraphStyle()
        paragraph.alignment = .center
        let attrs: [NSAttributedString.Key: Any] = [
            .font: font, .foregroundColor: color, .paragraphStyle: paragraph,
        ]
        let attributed = NSAttributedString(string: text, attributes: attrs)
        let size = attributed.boundingRect(
            with: CGSize(width: 500, height: 400), options: .usesLineFragmentOrigin, context: nil).size
        attributed.draw(in: CGRect(x: center.x - size.width / 2, y: center.y - size.height / 2,
                                   width: size.width, height: size.height))
    }
}

// MARK: - Certificate screen

struct CertificateView: View {
    @Environment(AppState.self) private var app
    @Environment(\.l10n) private var t
    @Query private var attempts: [AttemptRecord]

    @State private var includeStats = true
    @State private var pdfURL: URL?

    var body: some View {
        VStack(spacing: 12) {
            Toggle(t.pick("Dołącz statystyki", "Include statistics"), isOn: $includeStats)
                .padding(.horizontal)

            if let url = pdfURL {
                PDFPreview(url: url)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal)

                ShareLink(item: url) {
                    Label(t.pick("Udostępnij / Drukuj", "Share / Print"),
                          systemImage: "square.and.arrow.up")
                        .font(Theme.rounded(20))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity, minHeight: 56)
                        .background(Capsule().fill(Theme.purple))
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 12)
            } else {
                ProgressView()
                Spacer()
            }
        }
        .navigationTitle("🏅 " + t.certificates)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { regenerate() }
        .onChange(of: includeStats) { regenerate() }
        .onChange(of: app.languageRaw) { regenerate() }
    }

    private func regenerate() {
        let data = attempts.map(\.asData)
        let summary = StatisticsAggregator.summary(data)
        let stats = includeStats
            ? CertificateStats(solved: summary.solvedCorrectly,
                               accuracy: summary.accuracy,
                               coins: app.coins)
            : nil
        pdfURL = CertificateGenerator.makePDF(
            childName: app.childName, language: app.language, stats: stats, date: Date())
    }
}

private struct PDFPreview: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> PDFView {
        let view = PDFView()
        view.autoScales = true
        view.document = PDFDocument(url: url)
        view.backgroundColor = .clear
        return view
    }

    func updateUIView(_ uiView: PDFView, context: Context) {
        uiView.document = PDFDocument(url: url)
    }
}
