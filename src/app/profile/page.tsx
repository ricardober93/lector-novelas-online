"use client";

import React, { useEffect, useState } from "react";

type UserProfile = {
  name: string;
  avatarUrl: string;
  bio?: string;
  notifications?: {
    email?: boolean;
    inApp?: boolean;
  };
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>({
    name: "",
    avatarUrl: "",
    bio: "",
    notifications: { email: true, inApp: true },
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error("Error cargando perfil");
        const data = await res.json();
        setUser({
          name: data.name ?? data.username ?? "",
          avatarUrl: data.avatarUrl ?? data.avatar ?? "",
          bio: data.bio ?? "",
          notifications: data.notifications ?? { email: true, inApp: true },
        });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        notifications: user.notifications,
      };
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Error al guardar perfil");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <section style={{ padding: 24 }}>
      <h1>Perfil de usuario</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Nombre</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Avatar URL</label>
          <input
            type="text"
            value={user.avatarUrl}
            onChange={(e) => setUser({ ...user, avatarUrl: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          />
          {user.avatarUrl && (
            <img src={user.avatarUrl} alt="Avatar" style={{ width: 100, height: 100, marginTop: 8, objectFit: 'cover', borderRadius: 8 }} />
          )}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Biografía</label>
        <textarea
          rows={4}
          value={user.bio}
          onChange={(e) => setUser({ ...user, bio: e.target.value })}
          style={{ width: '100%', padding: 8 }}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Notificaciones</label>
        <div>
          <label style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={user.notifications?.email ?? true}
              onChange={(e) =>
                setUser({
                  ...user,
                  notifications: { ...(user.notifications ?? {}), email: e.target.checked },
                })
              }
            />
            Email
          </label>
          <label>
            <input
              type="checkbox"
              checked={user.notifications?.inApp ?? true}
              onChange={(e) =>
                setUser({
                  ...user,
                  notifications: { ...(user.notifications ?? {}), inApp: e.target.checked },
                })
              }
            />
            In-app
          </label>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <button onClick={save} disabled={saving} style={{ padding: '8px 12px' }}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </section>
  );
}
