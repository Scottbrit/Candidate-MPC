import { UpdateCandidate } from "@/features/candidates/components/update-candidate";
import { UpdateCandidateBlindedResume } from "@/features/candidates/components/update-candidate-blinded-resume";
import { CandidateCompanyPreferences } from "@/features/candidates/components/candidate-company-preferences";
import { CandidateCompanySelectionsTable } from "@/features/candidates/components/candidate-company-selections-table";
import { useParams } from "react-router";

const CandidateRoute = () => {
    const params = useParams();
    const candidateId = params.candidateId as string;

    return <div className="flex flex-col gap-4">
        <UpdateCandidate candidateId={candidateId} />
        <UpdateCandidateBlindedResume candidateId={candidateId} />
        <CandidateCompanyPreferences candidateId={candidateId} />
        <CandidateCompanySelectionsTable candidateId={candidateId} />
    </div>;
};

export default CandidateRoute;