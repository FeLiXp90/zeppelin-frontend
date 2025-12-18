<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="pageTitle" />

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div class="space-y-6 dark:text-white">
        <ComponentCard :title="pageTitle">
          <div class="space-y-4">
            <QuestionItem
              v-for="q in left"
              :key="q.id"
              :question="q"
              v-model:adoption="answers[q.id].adoption"
              v-model:comment="answers[q.id].comment"
            />
          </div>
        </ComponentCard>
      </div>

      <div class="space-y-6 dark:text-white">
        <ComponentCard title="continuação">
          <div class="space-y-4">
            <QuestionItem
              v-for="q in right"
              :key="q.id"
              :question="q"
              v-model:adoption="answers[q.id].adoption"
              v-model:comment="answers[q.id].comment"
            />
          </div>
        </ComponentCard>

        <div class="flex justify-end">
          <button 
            @click="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-brand-950 text-white rounded-lg hover:bg-brand-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import QuestionItem from './QuestionItem.vue'

import QUESTIONS from '@/data/agile_organization.json'
import { useQuestionnaire } from '@/composables/useQuestionnaire'
import { api } from '@/services/api'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const pageTitle = 'Agile Organization'

// composable para gerenciar respostas localmente
const { answers, left, right, dump } = useQuestionnaire(QUESTIONS as any)

const auth = useAuthStore()
const isLoading = ref(false)

/* =========================
   mapeamento fixo dos níveis de adoção
========================= */
const ADOPTION_LEVEL_MAPPING: Record<string, number> = {
  'Not adopted': 1,
  'Abandoned': 2,
  'Project / Product': 3,
  'Process': 4,
  'Institutionalized': 5,
}

/* =========================
   statement code -> id
   carrega do backend os statements existentes
========================= */
const statementMap = ref<Record<string, number>>({})

const loadStatements = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  let page = 1
  let totalPages = 1
  const allStatements: any[] = []

  // primeiro request
  const first = await api.get('/questionnaire/statement/', {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, per_page: 100 }
  })

  allStatements.push(...first.data.data)

  // calcula total de páginas
  if (first.data.meta) {
    totalPages = Math.ceil(first.data.meta.total / first.data.meta.per_page)
  }

  // pega as páginas restantes
  for (page = 2; page <= totalPages; page++) {
    const res = await api.get('/questionnaire/statement/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, per_page: 100 }
    })
    allStatements.push(...res.data.data)
  }

  // monta o statementMap
  allStatements.forEach((s: any) => {
    statementMap.value[s.code] = s.id
  })
}

/* =========================
   busca o employee logado e organização
========================= */
const getEmployeeData = async (): Promise<{ employeeId: number; organizationId: number } | null> => {
  const token = localStorage.getItem('access_token')
  const email = auth.user?.email

  if (!token || !email) return null

  let page = 1
  let totalPages = 1
  let employees: any[] = []

  // busca primeira página
  const first = await api.get('/employee/employee/', {
    headers: { Authorization: `Bearer ${token}` },
    params: { page }
  })

  employees.push(...first.data.data)

  if (first.data.meta) {
    totalPages = Math.ceil(first.data.meta.total / first.data.meta.per_page)
  }

  // busca demais páginas se existirem
  for (page = 2; page <= totalPages; page++) {
    const res = await api.get('/employee/employee/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { page }
    })
    employees.push(...res.data.data)
  }

  // encontra employee pelo e-mail
  const employee = employees.find(
    (e: any) => e.e_mail?.toLowerCase() === email.toLowerCase()
  )

  if (!employee) return null

  return {
    employeeId: employee.id,
    organizationId: employee.employee_organization.id
  }
}

/* =========================
   busca questionário existente do employee
========================= */
const getEmployeeQuestionnaireId = async (employeeId: number): Promise<number | null> => {
  const token = localStorage.getItem('access_token')
  if (!token) return null

  try {
    const res = await api.get('/questionnaire/questionnaire/', {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 1000 } // pegar todos
    })

    const questionnaires = res.data?.data || []
    const found = questionnaires.find((q: any) => q.employee_questionnaire_id === employeeId)
    return found?.id ?? null
  } catch (err) {
    console.error('Erro ao buscar questionário do employee:', err)
    return null
  }
}

/* =========================
   submit final
========================= */
const submit = async () => {
  try {
    console.log(' Iniciando envio do questionário')
    isLoading.value = true

    const token = localStorage.getItem('access_token')
    const headers = { Authorization: `Bearer ${token}` }

    console.log(' Buscando dados do employee logado...')
    // 1. employee + organization
    const employeeData = await getEmployeeData()
    if (!employeeData) {
      console.error(' Employee não encontrado')
      alert('employee nao encontrado')
      return
    }

    console.log(' Employee encontrado:', employeeData)

    // 2. pegar questionario existente
    console.log(' Verificando/criando questionnaire...')
    const questionnaireId = await getEmployeeQuestionnaireId(employeeData.employeeId)
    console.log('Questionnaire ID:', questionnaireId)

    // 3. respostas
    const answersData = dump()
    console.log(' Respostas coletadas do frontend:', answersData)

    for (const code in answersData) {
      const answer = answersData[code]

      const statementId = statementMap.value[code]
      const adoptedLevelId = ADOPTION_LEVEL_MAPPING[answer.adoption]

      console.log('----------------------------')
      console.log(`Preparando payload para a questão ${code}`)
      console.log('Resposta selecionada:', answer.adoption)
      console.log('Comentário:', answer.comment)
      console.log('Mapped statementId:', statementId)
      console.log('Mapped adoptedLevelId:', adoptedLevelId)
      console.log('OrganizationId:', employeeData.organizationId)

      if (!statementId || !adoptedLevelId) {
      console.warn(` Ignorando questão ${code}, ID não encontrado`)
      continue
    }

      const payload: any = {
        statement_answer: statementId,
        adopted_level_answer: adoptedLevelId,
        organization_answer: employeeData.organizationId,
        comment_answer: answer.comment || ''
      }

      // só inclui questionnaire_answer se existir
      if (questionnaireId) {
        payload.questionnaire_answer = questionnaireId
      }

      // 🔹 print do payload antes de enviar
      console.log('Payload enviado:', payload)

      try {
        const res = await api.post('/questionnaire/answer/', payload, { headers })
        console.log(' Resposta salva com sucesso:', res.data)
      } catch (err: any) {
        console.error(' Erro ao salvar resposta:', err.response?.data || err.message)
      }
    }

    alert('questionario salvo com sucesso')

  } catch (err: any) {
    console.error(err)
    alert('erro ao salvar questionario')
  } finally {
    isLoading.value = false
  }
}

/* =========================
   lifecycle
========================= */
onMounted(async () => {
  await loadStatements()
  console.log(' statementMap completo:', statementMap.value)
})
</script>
