"use client";

import Swal from "sweetalert2";

const alert = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: "pulse-swal-popup",
    title: "pulse-swal-title",
    htmlContainer: "pulse-swal-content",
    confirmButton: "pulse-swal-confirm",
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

export function showToast(
  icon: "success" | "error" | "info" | "warning",
  title: string,
) {
  return toast.fire({ icon, title });
}
