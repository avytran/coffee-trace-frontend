import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useWeb3Auth } from "../context/Web3AuthContext";

import { Card } from "../components/Common/Card";
import { Badge } from "../components/Common/Badge";
import { CreateBatchForm } from "../components/Farmer/CreateBatchForm";
import { BatchList } from "../components/Common/BatchList";
import { COLORS } from "../constants/colors";
import { BatchGridView } from "../components/Common/BatchGridView";
import { UserCard } from "../components/Common/UserCard";
import { BatchDetail } from "../components/Common/BatchDetail";

import FarmerWorkspaceActions from "../components/Farmer/FarmerWorkspaceActions";
import FarmerBatchActions from "../components/Farmer/FarmerBatchActions";

import CoopWorkspaceActions from "../components/Cooperative/CoopWorkspaceActions";
import CoopBatchActions from "../components/Cooperative/CoopBatchActions";

import ProcessorWorkspaceActions from "../components/Processor/ProcessorWorkspaceActions";
import ProcessorBatchActions from "../components/Processor/ProcessorBatchActions";

import ExporterBatchActions from "../components/Exporter/ExporterBatchActions";
import ExporterWorkspaceActions from "../components/Exporter/ExporterWorkspaceActions";
import ReceiverBatchActions from "../components/Receiver/ReceiverBatchActions";
import ReceiverWorkspaceActions from "../components/Receiver/ReceiverWorkspaceActions.jsx";

export default function BatchesPage({ setPage }) {
  const { userData, account, role } = useWeb3Auth();

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [view, setView] = useState("list"); // "list" | "grid" | "detail"
  const [search, setSearch] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  const fetchMyBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/batch/my-batches");
      if (response.data.success) {
        setLots(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi gọi dữ liệu danh sách lô hàng:", err);
      setError(err.response?.data?.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBatches();
  }, []);

  const handleOpenDetail = (id) => {
    setSelectedBatchId(id);
    setView("detail");
  };

  const renderRoleActions = () => {
    switch (role) {
      case "FARMER":
        return <FarmerBatchActions />
      case "COOPERATIVE":
        return <CoopBatchActions />
      case "PROCESSOR":
        return <ProcessorBatchActions />
      case "EXPORTER":
        return <ExporterBatchActions />
      case "RECEIVER":
        return <ReceiverBatchActions />
      default:
        return <></>;
    }
  };

  if (view === "detail" && selectedBatchId) {
    return (
      <div className="pt-6 pb-16 px-4 max-w-7xl mx-auto">
        <BatchDetail
          batchId={selectedBatchId}
          onBack={() => setView("list")}
          actionComponent={renderRoleActions()}
        />
      </div>
    );
  }

  const renderRoleWorkspace = () => {
    switch (role) {
      case "FARMER":
        return <FarmerWorkspaceActions
          lots={lots}
          setLots={setLots}
          loading={loading}
          error={error}
          view={view}
          setView={setView}
          search={search}
          setSearch={setSearch}
          handleOpenDetail={handleOpenDetail}
          fetchMyBatches={fetchMyBatches}
        />;
      case "COOPERATIVE":
        return <CoopWorkspaceActions
          lots={lots}
          setLots={setLots}
          loading={loading}
          error={error}
          view={view}
          setView={setView}
          search={search}
          setSearch={setSearch}
          handleOpenDetail={handleOpenDetail}
          fetchMyBatches={fetchMyBatches}
        />;
      case "PROCESSOR":
        return <ProcessorWorkspaceActions
          lots={lots}
          setLots={setLots}
          loading={loading}
          error={error}
          view={view}
          setView={setView}
          search={search}
          setSearch={setSearch}
          handleOpenDetail={handleOpenDetail}
          fetchMyBatches={fetchMyBatches}
        />;
      case "EXPORTER":
        return <ExporterWorkspaceActions
          lots={lots}
          setLots={setLots}
          loading={loading}
          error={error}
          view={view}
          setView={setView}
          search={search}
          setSearch={setSearch}
          handleOpenDetail={handleOpenDetail}
          fetchMyBatches={fetchMyBatches}
        />;
      case "RECEIVER":
        return <ReceiverWorkspaceActions
          lots={lots}
          setLots={setLots}
          loading={loading}
          error={error}
          view={view}
          setView={setView}
          search={search}
          setSearch={setSearch}
          handleOpenDetail={handleOpenDetail}
          fetchMyBatches={fetchMyBatches}
        />;
      default:
        return <div>Bạn không có quyền truy cập không gian này.</div>;
    }
  };

  return (
    <div className="pt-12 pb-16 px-4 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
      <UserCard userData={userData} role={role} />

      <main>
        {renderRoleWorkspace()}
      </main>
    </div>
  );
}