"use client"

import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function AlertDialogDestructive() {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setOpen(false)
        // Déconnecter l'utilisateur et rediriger
        await signOut({ callbackUrl: "/auth/login" })
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.message || "Impossible de supprimer le compte"}`)
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      alert("Une erreur est survenue lors de la suppression du compte")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Supprimer le compte</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-red-500">Supprimer le compte ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action supprimera définitivement votre compte et toutes les données associées. 
            Cette opération est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isLoading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isLoading}
            onClick={handleDeleteAccount}
          >
            {isLoading ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
