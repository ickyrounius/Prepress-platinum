"use client";

import FormLayout from "@/components/forms/FormLayout";

export default function SettingsPage() {
  return (
    <FormLayout 
      title="Sistem Settings" 
      description="Atur konfigurasi web app dan notifikasi."
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col items-center justify-center py-10 space-y-3 text-muted-foreground text-center">
        <h3 className="text-xl font-bold text-foreground">Akan Segera Tersedia</h3>
        <p className="max-w-md">Konfigurasi sinkronisasi webhook dan token GSheet akan tersedia disini.</p>
      </div>
    </FormLayout>
  );
}
