import React from "react";
import { useNavigate } from "react-router-dom";
import AdminRoomForm from "./AdminRoomForm";
import { adminCreateRoom, type RoomPayload } from "../../../lib/api";

const AdminRoomNew: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = React.useState(false);

  const onSubmit = async (payload: RoomPayload) => {
    try {
      setSaving(true);
      await adminCreateRoom(payload);
      navigate("/admin/rooms");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-semibold">New Room</h1>
      <AdminRoomForm onSubmit={onSubmit} submitting={saving} />
    </div>
  );
};

export default AdminRoomNew;
