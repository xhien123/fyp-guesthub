import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminRoomForm from "./AdminRoomForm";
import { adminGetRoom, adminUpdateRoom, type RoomPayload } from "../../../lib/api";

const AdminRoomEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initial, setInitial] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminGetRoom(id!);
        setInitial(data);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load room");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async (payload: RoomPayload) => {
    try {
      setSaving(true);
      await adminUpdateRoom(id!, payload);
      navigate("/admin/rooms");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!initial) return <p>Not found.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-semibold">Edit Room</h1>
      <AdminRoomForm initial={initial} onSubmit={onSubmit} submitting={saving} />
    </div>
  );
};

export default AdminRoomEdit;
