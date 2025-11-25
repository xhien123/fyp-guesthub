import React from "react";
import { useNavigate } from "react-router-dom";
import AdminMenuForm from "./AdminMenuForm";
import { adminCreateMenuItem, type MenuItemPayload } from "../../../lib/api";

const AdminMenuNew: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = React.useState(false);

  const onSubmit = async (payload: MenuItemPayload) => {
    try {
      setSaving(true);
      await adminCreateMenuItem(payload);
      navigate("/admin/menu");
    } catch (error) {
        console.error("Failed to create", error);
        alert("Failed to create item. Please check all fields.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-neutral-900">New Menu Item</h1>
        <p className="text-neutral-500">Add a dish to the restaurant menu.</p>
      </div>
      <AdminMenuForm onSubmit={onSubmit} submitting={saving} />
    </div>
  );
};

export default AdminMenuNew;