import Link from "next/link";

export default function Home() {
    return (
          <div className="space-y-10">
                <section className="text-center space-y-4 py-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-navy">
                                  Assess. Predict. Train. Hire.
                        </h1>h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                                  This is a working MVP of the SkillBridge AI loop: a student takes an AI-scored
                                  interest &amp; skills assessment, gets a personalized career report and training
                                  roadmap, and — once trained — becomes discoverable to employers searching a
                                  verified skills database.
                        </p>p>
                </section>section>
          
                <section className="grid md:grid-cols-3 gap-6">
                        <div className="card space-y-3">
                                  <h2 className="font-bold text-lg text-navy">Student</h2>h2>
                                  <p className="text-sm text-gray-600">
                                              Take the assessment, get an AI-generated career report, and a training roadmap.
                                  </p>p>
                                  <Link href="/student" className="btn-primary">Start assessment</Link>Link>
                        </div>div>
                        <div className="card space-y-3">
                                  <h2 className="font-bold text-lg text-navy">University</h2>h2>
                                  <p className="text-sm text-gray-600">
                                              Career-services view: cohort interests, skill gaps, and top career clusters.
                                  </p>p>
                                  <Link href="/university" className="btn-primary">View dashboard</Link>Link>
                        </div>div>
                        <div className="card space-y-3">
                                  <h2 className="font-bold text-lg text-navy">Employer</h2>h2>
                                  <p className="text-sm text-gray-600">
                                              Post a role and see ranked, verified candidates from the student database.
                                  </p>p>
                                  <Link href="/employer" className="btn-primary">View jobs</Link>Link>
                        </div>div>
                </section>section>
          </div>div>
        );
}
</div>
