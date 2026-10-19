"use client";

import Swal from "sweetalert2";

const alert = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: "pulse-swal-popup",
    title: "pulse-swal-title",
    htmlContainer: "pulse-swal-content",
    confirmButton: "pulse-swal-confirm",
    cancelButton: "pulse-swal-cancel",
  },
  confirmButtonText: "Aceptar",
});

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  customClass: {
    popup: "pulse-swal-toast",
  },
});

export function showSuccessAlert(title: string, text?: string) {
  return alert.fire({ icon: "success", title, text });
}

export function showErrorAlert(title: string, text?: string) {
  return alert.fire({ icon: "error", title, text });
}

export function showWarningAlert(title: string, text?: string) {
  return alert.fire({ icon: "warning", title, text });
}

/**
 * Muestra un diálogo de confirmación con botones "Confirmar" y "Cancelar".
 * Retorna `true` si el usuario confirma la acción, `false` si la cancela.
 */
export async function showConfirmAlert(
  title: string,
  text?: string,
): Promise<boolean> {
  const result = await alert.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export function showToast(
  icon: "success" | "error" | "info" | "warning",
  title: string,
) {
  return toast.fire({ icon, title });
}
