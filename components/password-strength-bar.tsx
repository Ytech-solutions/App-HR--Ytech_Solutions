"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2,
  Info
} from "lucide-react"

interface PasswordStrengthBarProps {
  password: string
  showDetails?: boolean
}

interface PasswordRequirement {
  id: string
  label: string
  regex: RegExp
  isValid: boolean
  icon: React.ReactNode
}

export function PasswordStrengthBar({ password, showDetails = true }: PasswordStrengthBarProps) {
  const requirements: PasswordRequirement[] = [
    {
      id: "length",
      label: "Au moins 8 caractères",
      regex: /.{8,}/,
      isValid: password.length >= 8,
      icon: <CheckCircle2 className="w-4 h-4" />
    },
    {
      id: "uppercase",
      label: "Une majuscule (A-Z)",
      regex: /[A-Z]/,
      isValid: /[A-Z]/.test(password),
      icon: <CheckCircle2 className="w-4 h-4" />
    },
    {
      id: "lowercase",
      label: "Une minuscule (a-z)",
      regex: /[a-z]/,
      isValid: /[a-z]/.test(password),
      icon: <CheckCircle2 className="w-4 h-4" />
    },
    {
      id: "number",
      label: "Un chiffre (0-9)",
      regex: /\d/,
      isValid: /\d/.test(password),
      icon: <CheckCircle2 className="w-4 h-4" />
    },
    {
      id: "special",
      label: "Un caractère spécial (!@#$%^&*...)",
      regex: /[!@#$%^&*(),.?":{}|<>]/,
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      icon: <CheckCircle2 className="w-4 h-4" />
    }
  ]

  const calculateStrength = () => {
    if (!password) return { score: 0, level: "vide", color: "bg-gray-200", textColor: "text-gray-500" }
    
    const validRequirements = requirements.filter(req => req.isValid).length
    const score = (validRequirements / requirements.length) * 100

    if (score <= 20) {
      return { 
        score, 
        level: "Très faible", 
        color: "bg-red-500", 
        textColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: <XCircle className="w-5 h-5 text-red-500" />
      }
    }
    if (score <= 40) {
      return { 
        score, 
        level: "Faible", 
        color: "bg-orange-500", 
        textColor: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />
      }
    }
    if (score <= 60) {
      return { 
        score, 
        level: "Moyen", 
        color: "bg-yellow-500", 
        textColor: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />
      }
    }
    if (score <= 80) {
      return { 
        score, 
        level: "Fort", 
        color: "bg-blue-500", 
        textColor: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: <Shield className="w-5 h-5 text-blue-500" />
      }
    }
    return { 
      score, 
      level: "Très fort", 
      color: "bg-emerald-500", 
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />
    }
  }

  const strength = calculateStrength()
  const validCount = requirements.filter(req => req.isValid).length

  const getStrengthTips = () => {
    if (!password) return []
    
    const tips = []
    if (password.length < 8) tips.push("Ajoutez des caractères pour atteindre 8")
    if (!/[A-Z]/.test(password)) tips.push("Ajoutez une majuscule")
    if (!/[a-z]/.test(password)) tips.push("Ajoutez une minuscule")
    if (!/\d/.test(password)) tips.push("Ajoutez un chiffre")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) tips.push("Ajoutez un caractère spécial")
    
    return tips
  }

  const tips = getStrengthTips()

  return (
    <div className="space-y-4">
      {/* Barre de progression principale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {strength.icon}
            <span className="text-sm font-medium">Force du mot de passe</span>
          </div>
          <Badge 
            variant={strength.level === "Très fort" ? "default" : "secondary"}
            className={`${strength.bgColor} ${strength.textColor} border-0`}
          >
            {strength.level}
          </Badge>
        </div>
        <Progress 
          value={strength.score} 
          className="h-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{validCount}/{requirements.length} critères respectés</span>
          <span>{Math.round(strength.score)}%</span>
        </div>
      </div>

      {/* Exigences détaillées */}
      {showDetails && (
        <div className={`p-4 rounded-lg border ${strength.bgColor} ${strength.borderColor}`}>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Exigences de sécurité
          </h4>
          <div className="space-y-2">
            {requirements.map((requirement) => (
              <div 
                key={requirement.id}
                className={`flex items-center gap-2 text-sm ${
                  requirement.isValid ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  requirement.isValid ? "bg-emerald-100" : "bg-gray-100"
                }`}>
                  {requirement.isValid ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <span className={requirement.isValid ? "font-medium" : ""}>
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>

          {/* Conseils d'amélioration */}
          {tips.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h5 className="text-sm font-medium text-muted-foreground mb-2">
                Suggestions d'amélioration :
              </h5>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Informations de sécurité supplémentaires */}
      {showDetails && password && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Un mot de passe fort protège vos données personnelles</p>
          <p>• Évitez d'utiliser des informations personnelles (nom, date de naissance)</p>
          <p>• Ne réutilisez pas le même mot de passe sur plusieurs sites</p>
        </div>
      )}
    </div>
  )
}
