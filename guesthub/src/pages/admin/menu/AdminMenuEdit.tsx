import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminMenuForm from "./AdminMenuForm";
import { adminGetMenuItem, adminUpdateMenuItem, type MenuItemPayload } from "../../../lib/api";

const AdminMenuEdit: React.FC = () => {
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
        const data = await adminGetMenuItem(id!);
        setInitial(data);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load item");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async (payload: MenuItemPayload) => {
    try {
      setSaving(true);
      await adminUpdateMenuItem(id!, payload);
      navigate("/admin/menu");
    } catch (error) {
        console.error("Failed to update", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-neutral-500">Loading dish details...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
  if (!initial) return <div className="p-4 text-neutral-500">Dish not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-neutral-900">Edit Dish</h1>
        <p className="text-neutral-500">Update details for {initial.name}</p>
      </div>
      <AdminMenuForm initial={initial} onSubmit={onSubmit} submitting={saving} />
    </div>
  );
};

export default AdminMenuEdit;