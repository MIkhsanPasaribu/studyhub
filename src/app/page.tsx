import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">StudyHub</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Platform belajar terpadu untuk meningkatkan produktivitas dan fokus Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:bg-foreground/90 transition-colors"
            >
              Mulai Belajar
            </Link>
            <Link 
              href="/auth" 
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] px-6 py-3 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              Login / Register
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Pomodoro Timer</h3>
            <p className="text-muted-foreground">Tingkatkan fokus dengan teknik Pomodoro yang telah terbukti efektif untuk manajemen waktu.</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Catatan & Tugas</h3>
            <p className="text-muted-foreground">Kelola catatan dan tugas dalam satu tempat dengan fitur pengorganisasian yang intuitif.</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 20v-6"/>
                <path d="M6 20V10"/>
                <path d="M18 20V4"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analitik Belajar</h3>
            <p className="text-muted-foreground">Pantau kemajuan belajar Anda dengan visualisasi data dan wawasan yang membantu meningkatkan produktivitas.</p>
          </div>
        </div>

        {/* Calendar Preview */}
        <div className="bg-card p-6 rounded-lg shadow-sm my-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Kelola Jadwal Belajar Anda</h2>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Preview Kalender</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} StudyHub. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Tentang Kami</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Bantuan</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
