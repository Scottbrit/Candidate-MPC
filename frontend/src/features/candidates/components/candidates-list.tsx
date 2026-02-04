import { GenericDataTable } from "@/components/tables/DataTables/TableThree/GenericDataTable";
import type { TableConfig } from "@/components/tables/DataTables/TableThree/GenericDataTable";
import { useCandidates } from '../api/get-candidates';
import type { Candidate } from '@/types/api';
import { DeleteCandidate } from './delete-candidate';
import { SendCandidateEmail } from './send-candidate-email';
import { DownloadResume } from './download-resume';
import { StatusBadge } from './status-badge';
import { ViewCandidateDetails } from './view-candidate-details';
import { CreateCampaign } from './create-campaign';
import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import Button from '@/components/ui/button/Button';
import { PlusIcon } from '@/components/ui/icons';

const tableConfig: TableConfig<Candidate> = {
  // Define searchable fields for candidates
  searchFields: ['first_name', 'last_name', 'email', 'linkedin_url'],
  columns: [
    {
      key: "full_name",
      label: "Full Name",
      type: "string",
      sortable: true,
      formatValue: (value: unknown) => {
        if (typeof value === 'object' && value !== null) {
          const candidate = value as Candidate;
          return `${candidate.first_name} ${candidate.last_name}`;
        }
        return String(value);
      },
      getSortValue: (item: Candidate) => {
        return `${item.first_name} ${item.last_name}`.toLowerCase();
      },
    },
    {
      key: "role",
      label: "Role",
      type: "string",
      sortable: true,
      formatValue: (value: unknown) => {
        return (value as Candidate).role == "COS" ? "CoS" : (value as Candidate).role == "ENGINEERING" ? "Engineering" : (value as Candidate).role == "PRODUCT" ? "Product" : (value as Candidate).role == "MARKETING" ? "Marketing" : (value as Candidate).role == "REVENUE" ? "Revenue" : (value as Candidate).role == "OPERATIONS" ? "Operations" : "";
      },
      getSortValue: (item: Candidate) => {
        return (item.role as string).toLowerCase();
      },
    },
    {
      key: "email",
      label: "Email",
      type: "string",
      sortable: true,
    },
    {
      key: "linkedin_url",
      label: "LinkedIn",
      type: "string",
      sortable: true,
    },
    {
      key: "processing_status",
      label: "Status",
      type: "action",
      sortable: true,
      renderAction: (item) => (
        <StatusBadge status={item.processing_status} />
      ),
    },
    {
      key: "resume",
      label: "Resume",
      type: "action",
      sortable: false,
      renderAction: (item) => <DownloadResume candidate={item} />,
    },
    {
      key: "actions",
      label: "Actions",
      type: "action",
      sortable: false,
      renderAction: (item) => (
        <div className="flex items-center w-full gap-2">
          <ViewCandidateDetails candidate={item} />
          <SendCandidateEmail candidate={item} />
          <CreateCampaign candidate={item} />
          <DeleteCandidate candidate={item} />
        </div>
      ),
    },
  ],
  itemsPerPageOptions: [5, 10, 20],
  defaultItemsPerPage: 10,
};

const CandidatesList = () => {
  const navigate = useNavigate();
  const candidatesQuery = useCandidates({
    page: 1, // Default to first page for now
    queryConfig: {
      refetchInterval: 5 * 1000, // 10 seconds
    },
  });

  if (candidatesQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const candidates = candidatesQuery.data?.data || [];

  if (!candidates) return null;

  const handleAction = async (action: string, item: Candidate) => {
    console.log("Unknown action:", action, item);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Candidates 3</h1>
        <Button
          onClick={() => navigate(paths.app.newCandidate.getHref())}
          variant="primary"
          size="md"
          startIcon={<PlusIcon className="size-4" />}
        >
          New Candidate
        </Button>
      </div>
      <GenericDataTable<Candidate>
        data={candidates}
        config={tableConfig}
        onAction={handleAction}
      />
    </div>
  );
};

export default CandidatesList;