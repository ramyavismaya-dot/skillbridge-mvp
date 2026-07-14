import { createJob } from "@/app/actions";
import { ROLES } from "@/lib/riasec";

export default function NewJobPage() {
    return (
          <div className="max-w-lg mx-auto space-y-6">
                <div>
                        <h1 className="text-2xl font-bold text-navy">Post a Role</h1>h1>
                        <p className="text-gray-500 text-sm">
                                  Pick the closest role template — its required interest profile and skills are used to
                                  rank candidates from the student database.
                        </p>p>
                </div>div>
          
                <form action={createJob} className="card space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                                  Job title
                                  <input name="title" required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Junior Data Analyst" />
                        </label>label>
                
                        <label className="block text-sm font-medium text-gray-700">
                                  Company
                                  <input name="company" required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Acme Corp" />
                        </label>label>
                
                        <label className="block text-sm font-medium text-gray-700">
                                  Closest role template
                                  <select name="roleId" className="mt-1 w-full border rounded-md px-3 py-2">
                                    {ROLES.map((r) => (
                          <option key={r.id} value={r.id}>{r.title}</option>option>
                        ))}
                                  </select>select>
                        </label>label>
                
                        <button type="submit" className="btn-primary w-full text-center">Post role &amp; see matches</button>button>
                </form>form>
          </div>div>
        );
}
</div>
