import CandidatesList from "@/features/candidates/components/candidates-list";

const Dashboard = () => {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
                <CandidatesList />
            </div>
        </div>
    )
}

export default Dashboard;