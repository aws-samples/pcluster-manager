import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import i18n from '../../../i18n'
import { ListClusters } from '../../../model'
import { store, clearState, setState } from '../../../store'
import Clusters, { onClustersUpdate } from '../Clusters'
import { ClusterStatus, ClusterInfoSummary } from '../../../types/clusters'
import { CloudFormationStackStatus } from '../../../types/base'


const queryClient = new QueryClient();
const mockClusters: ClusterInfoSummary[] = [{
  clusterName: 'test-cluster',
  clusterStatus: ClusterStatus.CreateComplete,
  version: '3.1.4',
  cloudformationStackArn: 'arn',
  region: 'region',
  cloudformationStackStatus: CloudFormationStackStatus.CreateComplete
}];

const MockProviders = (props: any) => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <ThemeProvider theme={createTheme()}>
            <BrowserRouter>
              {props.children}
            </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </I18nextProvider>
  </QueryClientProvider>
)

jest.mock('../../../model', () => ({
  ListClusters: jest.fn(),
}));

jest.mock('../../../store', () => ({
  ...jest.requireActual('../../../store') as any,
  isAdmin: () => true,
  setState: jest.fn(),
  clearState: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockNavigate,
}));

describe('given a component to show the clusters list', () => {

  describe('when the clusters list is available', () => {
    beforeEach(() => {
      (ListClusters as jest.Mock).mockResolvedValue(mockClusters);
      mockNavigate.mockReset();
    });

    it('should render the clusters', async () => {
      const { getByText } = await waitFor(() => render(
        <MockProviders>
          <Clusters />
        </MockProviders>
      ))   

      expect(getByText('test-cluster')).toBeTruthy()
      expect(getByText('CREATE COMPLETE')).toBeTruthy()
      expect(getByText('3.1.4')).toBeTruthy()
    })

    describe('when the user selects a cluster', () => { 
      it('should populate the split panel', async () => {
        const output = await waitFor(() => render(
          <MockProviders>
            <Clusters />
          </MockProviders>
        ))       
        
        await userEvent.click(output.getByRole('radio'))
        expect(mockNavigate).toHaveBeenCalledWith('/clusters/test-cluster')
      })
    })

    describe('when the user clicks on "Create Cluster" button', () => {
      it('should redirect to configure', async () => {
        const output = await waitFor(() => render(
          <MockProviders>
            <Clusters />
          </MockProviders>
        ))       
        
        await userEvent.click(output.getByText('Create Cluster'))
        expect(mockNavigate).toHaveBeenCalledWith('/configure')
      })
    })
  })
  
  describe('when there are no clusters available', () => {
    beforeEach(() => {
      (ListClusters as jest.Mock).mockResolvedValue([]);
    });

    it('should show the empty state', async () => {
      const { getByText } = await waitFor(() => render(
        <MockProviders>
          <Clusters />
        </MockProviders>
      ))

      expect(getByText('No clusters to display')).toBeTruthy()
    }) 
  }) 
})

describe("Given a list of clusters", () => {
  beforeEach(() => jest.resetAllMocks()); 
  describe("when a cluster is selected and the list is updated", () => {
    describe("when the cluster has a new status", () => {
      it("should be saved", () => {
        onClustersUpdate("test-cluster", mockClusters, ClusterStatus.CreateInProgress, mockNavigate);

        expect(setState).toHaveBeenCalledWith(['app', 'clusters', 'selectedStatus'], ClusterStatus.CreateComplete);
      });
    });

    describe("when the cluster has the same status", () => {
      it("should not be updated", () => {
        onClustersUpdate("test-cluster", mockClusters, ClusterStatus.CreateComplete, mockNavigate);

        expect(setState).not.toHaveBeenCalled();
      });
    });

    describe("when a cluster is deleted", () => {
      beforeEach(() => {
        onClustersUpdate("test-cluster", mockClusters, ClusterStatus.DeleteInProgress, mockNavigate);
      });
      it("should become unselected", () => {
        expect(clearState).toHaveBeenCalledWith(['app', 'clusters', 'selected']);
      });
      it("should navigate to the clusters list", () => {
        expect(mockNavigate).toHaveBeenCalledWith('/clusters');
      });
    });
  })
});
