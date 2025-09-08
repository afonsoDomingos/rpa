<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import html2pdf from 'html2pdf.js'
import NavbarDefault from "../examples/navbars/NavbarDefault.vue"
import FooterDefault from "../examples/footers/FooterDefault.vue"
import exemploPhoto from '@/assets/img/afonsodomingos.jpg'
import logo from '@/assets/img/rPa.png'

// Função para debounce
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Estado
const form = reactive({
  name: '',
  title: '',
  idNumber: '',
  birthDate: '',
  email: '',
  phone: '',
  address: '',
  socialLinks: {
    linkedin: '',
    facebook: '',
    instagram: '',
    website: ''
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  skills: [],
  languages: [],
  references: []
})

const photo = ref(null)
let photoObjectUrl = null
const isFilled = ref(false)
const isGenerating = ref(false)
const errorsList = ref([])
const fieldErrors = reactive({})
const successMessage = ref('')
const liveMessage = ref('')
const showPreviewHeader = ref(true)
const photoInput = ref(null)
const isNavOpen = ref(false) // Estado para menu colapsável

// Opções
const languageOptions = ['Português', 'Inglês', 'Francês', 'Espanhol', 'Chinês', 'Alemão']
const levelOptions = ['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo']

// Propriedades Computadas
const photoAlt = computed(() => `Foto de perfil de ${form.name || 'usuário'}`)
const formattedBirthDate = computed(() => {
  if (!form.birthDate) return ''
  try {
    const d = new Date(form.birthDate)
    return isNaN(d.getTime()) ? 'Data inválida' : d.toLocaleDateString('pt-BR')
  } catch {
    return 'Data inválida'
  }
})
const hasSocialLinks = computed(() => {
  return !!(form.socialLinks.linkedin || form.socialLinks.facebook || form.socialLinks.instagram || form.socialLinks.website)
})
const socialNames = computed(() => {
  return {
    linkedin: form.socialLinks.linkedin ? 'Afonso Domingos' : '',
    facebook: form.socialLinks.facebook ? 'Techvibemz' : '',
    instagram: form.socialLinks.instagram ? 'Techvibemz' : '',
    website: form.socialLinks.website ? 'Website' : ''
  }
})
const sortedExperience = computed(() => {
  return [...form.experience].sort((a, b) => {
    const yearA = parseInt(a.period.split('–')[1] || a.period) || 0
    const yearB = parseInt(b.period.split('–')[1] || b.period) || 0
    return yearB - yearA
  })
})
const sortedEducation = computed(() => {
  return [...form.education].sort((a, b) => {
    const yearA = parseInt(a.period) || 0
    const yearB = parseInt(b.period) || 0
    return yearB - yearA
  })
})
const sortedProjects = computed(() => {
  return [...form.projects].sort((a, b) => {
    const yearA = parseInt(a.period.split('–')[1] || a.period) || 0
    const yearB = parseInt(b.period.split('–')[1] || b.period) || 0
    return yearB - yearA
  })
})
const sortedCertifications = computed(() => {
  return [...form.certifications].sort((a, b) => {
    const yearA = parseInt(a.date) || 0
    const yearB = parseInt(b.date) || 0
    return yearB - yearA
  })
})

// Referências para foco
const nameInput = ref(null)
const emailInput = ref(null)
const phoneInput = ref(null)

// Métodos
const triggerPhotoUpload = () => {
  if (photoInput.value) photoInput.value.click()
}

const onPhotoUpload = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl)
  photoObjectUrl = URL.createObjectURL(file)
  photo.value = photoObjectUrl
}

const removePhoto = () => {
  if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl)
  photoObjectUrl = null
  photo.value = null
  if (photoInput.value) photoInput.value.value = ''
}

const onPhoneInput = (e) => {
  const raw = (e.target.value || '').replace(/\D/g, '').slice(0, 9)
  const parts = []
  if (raw.length > 0) parts.push(raw.slice(0, 3))
  if (raw.length > 3) parts.push(raw.slice(3, 6))
  if (raw.length > 6) parts.push(raw.slice(6, 9))
  form.phone = parts.join(' ')
}

const onBIInput = (e) => {
  form.idNumber = (e.target.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20)
}

const debouncedPhoneInput = debounce(onPhoneInput, 300)
const debouncedBIInput = debounce(onBIInput, 300)

const addItem = (type) => {
  switch (type) {
    case 'experience':
      form.experience.push({ company: '', role: '', period: '', yearsExp: 0, description: '' })
      break
    case 'education':
      form.education.push({ institution: '', degree: '', period: '' })
      break
    case 'projects':
      form.projects.push({ name: '', description: '', period: '', technologies: '', link: '' })
      break
    case 'certifications':
      form.certifications.push({ name: '', institution: '', date: '', link: '' })
      break
    case 'skills':
      form.skills.push('')
      break
    case 'languages':
      form.languages.push({ language: '', level: '' })
      break
    case 'references':
      form.references.push({ name: '', role: '' })
      break
  }
}

const removeItem = (type, index) => {
  form[type].splice(index, 1)
}

const resetForm = async () => {
  Object.assign(form, {
    name: '', title: '', idNumber: '', birthDate: '',
    email: '', phone: '', address: '',
    socialLinks: { linkedin: '', facebook: '', instagram: '', website: '' },
    summary: '',
    experience: [], education: [], projects: [], certifications: [], skills: [], languages: [], references: []
  })
  removePhoto()
  isFilled.value = false
  errorsList.value = []
  Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
  successMessage.value = 'Formulário resetado com sucesso!'
  liveMessage.value = 'Formulário foi resetado com sucesso.'
  await nextTick()
  nameInput.value?.focus()
  setTimeout(() => { successMessage.value = ''; liveMessage.value = '' }, 3500)
}

const toggleExampleData = async () => {
  if (!isFilled.value) {
    removePhoto()
    photo.value = exemploPhoto
    Object.assign(form, {
      name: 'Afonso Domingos',
      title: 'Desenvolvedor Front-End',
      idNumber: '110301744616C',
      birthDate: '1999-10-14',
      email: 'karinganastudio23@gmail.com',
      phone: '847 877 405',
      address: 'Maputo, Moçambique',
      socialLinks: {
        linkedin: 'https://www.linkedin.com/in/afonso-domingos-6b59361a5/',
        facebook: 'https://web.facebook.com/Techvibemz/',
        instagram: 'https://www.instagram.com/techvibemz/',
        website: ''
      },
      summary: 'Desenvolvedor front-end apaixonado por criar interfaces modernas e funcionais.',
      experience: [
        { company: 'Front-End DpWorks', role: 'Desenvolvedor', period: '2018–2020', yearsExp: 2, description: 'Desenvolvimento de lojas online.' },
        { company: 'Quinatec Lda', role: 'IT Specialist', period: '2024', yearsExp: 1, description: 'Gestão de projetos.' }
      ],
      education: [
        { institution: 'Maxaquene B', degree: '7ª Classe', period: '2010', description: '' },
        { institution: 'Noroeste 1', degree: '12ª Classe', period: '2018', description: '' }
      ],
      projects: [
        { 
          name: 'Rpa Moçambique', 
          description: 'Plataforma para recuperação de documentos perdidos, com registro rápido, busca otimizada por nome e notificações.', 
          period: '2020–2025', 
          technologies: 'Vue.js, JavaScript, CSS', 
          link: 'https://github.com/afonsoDomingos/rpa' 
        },
      ],
      certifications: [
        { 
          name: 'Above - Multimedia', 
          institution: 'Above', 
          date: '2022', 
          link: '' 
        },
      ],
      skills: ['JavaScript', 'Vue.js', 'React'],
      languages: [
        { language: 'Português', level: 'Nativo' },
        { language: 'Inglês', level: 'Fluente' }
      ],
      references: [
        { name: 'Inácio Birrisau', role: 'Empreendedor' },
        { name: 'Silva Machel', role: 'Desenvolvedor' }
      ]
    })
    isFilled.value = true
    successMessage.value = 'Dados de exemplo preenchidos com sucesso!'
    liveMessage.value = 'Formulário preenchido com dados de exemplo.'
    await nextTick()
    nameInput.value?.focus()
  } else {
    resetForm()
  }
  setTimeout(() => { successMessage.value = ''; liveMessage.value = '' }, 3000)
}

const validateForm = async () => {
  errorsList.value = []
  Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])

  // Nome
  if (!form.name.trim()) {
    fieldErrors.name = 'O nome completo é obrigatório.'
    errorsList.value.push(fieldErrors.name)
  }

  // Email
  const email = form.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    fieldErrors.email = 'O email é obrigatório.'
    errorsList.value.push(fieldErrors.email)
  } else if (!emailRegex.test(email)) {
    fieldErrors.email = 'Por favor, insira um email válido.'
    errorsList.value.push(fieldErrors.email)
  }

  // Telefone
  const phoneDigits = form.phone.replace(/\D/g, '')
  if (!phoneDigits) {
    fieldErrors.phone = 'O telefone é obrigatório.'
    errorsList.value.push(fieldErrors.phone)
  } else if (phoneDigits.length !== 9) {
    fieldErrors.phone = 'O telefone deve conter 9 dígitos (ex: 847 877 405).'
    errorsList.value.push(fieldErrors.phone)
  }

  // Data de Nascimento
  if (form.birthDate) {
    const d = new Date(form.birthDate)
    if (isNaN(d.getTime())) {
      fieldErrors.birthDate = 'Por favor, insira uma data de nascimento válida.'
      errorsList.value.push(fieldErrors.birthDate)
    } else if (d > new Date()) {
      fieldErrors.birthDate = 'A data de nascimento não pode ser futura.'
      errorsList.value.push(fieldErrors.birthDate)
    }
  }

  // URLs das Redes Sociais
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  const socialFields = ['linkedin', 'facebook', 'instagram', 'website']
  socialFields.forEach(field => {
    const url = form.socialLinks[field].trim()
    if (url && !urlRegex.test(url)) {
      fieldErrors[field] = `Por favor, insira um link válido para ${field.charAt(0).toUpperCase() + field.slice(1)}.`
      errorsList.value.push(fieldErrors[field])
    }
  })

  // Validação de Períodos (Experiência, Projetos)
  const periodRegex = /^\d{4}(–\d{4})?$/
  form.experience.forEach((exp, i) => {
    if (exp.period && !periodRegex.test(exp.period)) {
      fieldErrors[`exp-period-${i}`] = 'Período deve estar no formato "YYYY" ou "YYYY–YYYY".'
      errorsList.value.push(fieldErrors[`exp-period-${i}`])
    }
  })
  form.projects.forEach((project, i) => {
    if (project.period && !periodRegex.test(project.period)) {
      fieldErrors[`project-period-${i}`] = 'Período deve estar no formato "YYYY" ou "YYYY–YYYY".'
      errorsList.value.push(fieldErrors[`project-period-${i}`])
    }
    if (project.link && !urlRegex.test(project.link)) {
      fieldErrors[`project-link-${i}`] = 'Por favor, insira um link válido para o projeto.'
      errorsList.value.push(fieldErrors[`project-link-${i}`])
    }
  })

  // Validação de Períodos e Links (Certificações, Formação)
  form.education.forEach((edu, i) => {
    if (edu.period && !/^\d{4}$/.test(edu.period)) {
      fieldErrors[`edu-period-${i}`] = 'Ano de conclusão deve ser um ano válido (ex.: 2020).'
      errorsList.value.push(fieldErrors[`edu-period-${i}`])
    }
  })
  form.certifications.forEach((cert, i) => {
    if (cert.date && !/^\d{4}$/.test(cert.date)) {
      fieldErrors[`cert-date-${i}`] = 'Data de emissão deve ser um ano válido (ex.: 2020).'
      errorsList.value.push(fieldErrors[`cert-date-${i}`])
    }
    if (cert.link && !urlRegex.test(cert.link)) {
      fieldErrors[`cert-link-${i}`] = 'Por favor, insira um link válido para o certificado.'
      errorsList.value.push(fieldErrors[`cert-link-${i}`])
    }
  })

  if (errorsList.value.length) {
    liveMessage.value = 'Por favor, corrija os erros no formulário antes de prosseguir.'
    await nextTick()
    if (fieldErrors.name) nameInput.value?.focus()
    else if (fieldErrors.email) emailInput.value?.focus()
    else if (fieldErrors.phone) phoneInput.value?.focus()
    else if (fieldErrors.birthDate) document.getElementById('input-birth')?.focus()
    else if (fieldErrors.linkedin) document.getElementById('input-linkedin')?.focus()
    else if (fieldErrors.facebook) document.getElementById('input-facebook')?.focus()
    else if (fieldErrors.instagram) document.getElementById('input-instagram')?.focus()
    else if (fieldErrors.website) document.getElementById('input-website')?.focus()
    else {
      for (let i = 0; i < form.experience.length; i++) {
        if (fieldErrors[`exp-period-${i}`]) {
          document.getElementById(`exp-period-${i}`)?.focus()
          break
        }
      }
      for (let i = 0; i < form.education.length; i++) {
        if (fieldErrors[`edu-period-${i}`]) {
          document.getElementById(`edu-period-${i}`)?.focus()
          break
        }
      }
      for (let i = 0; i < form.projects.length; i++) {
        if (fieldErrors[`project-period-${i}`]) {
          document.getElementById(`project-period-${i}`)?.focus()
          break
        } else if (fieldErrors[`project-link-${i}`]) {
          document.getElementById(`project-link-${i}`)?.focus()
          break
        }
      }
      for (let i = 0; i < form.certifications.length; i++) {
        if (fieldErrors[`cert-date-${i}`]) {
          document.getElementById(`cert-date-${i}`)?.focus()
          break
        } else if (fieldErrors[`cert-link-${i}`]) {
          document.getElementById(`cert-link-${i}`)?.focus()
          break
        }
      }
    }
    return false
  }

  liveMessage.value = 'Formulário validado com sucesso.'
  return true
}

const generateCV = async () => {
  if (isGenerating.value) return
  isGenerating.value = true
  successMessage.value = ''
  const ok = await validateForm()
  if (!ok) {
    isGenerating.value = false
    return
  }
  showPreviewHeader.value = false
  await nextTick()
  const element = document.getElementById('cv-preview')
  if (!element) {
    isGenerating.value = false
    errorsList.value = ['Erro ao localizar a pré-visualização. Tente novamente.']
    liveMessage.value = 'Erro ao gerar o PDF.'
    return
  }
  try {
    await html2pdf().set({
      margin: [8, 8, 8, 8],
      filename: `${form.name.replace(/\s+/g, '_') || 'CV'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        width: 794,
        windowWidth: 794,
        useCORS: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      }
    }).from(element).save()
    successMessage.value = 'CV gerado com sucesso!'
    liveMessage.value = 'Seu currículo foi gerado e baixado com sucesso.'
  } catch (err) {
    console.error('Erro ao gerar PDF:', err)
    errorsList.value = ['Erro ao gerar o PDF. Por favor, tente novamente.']
    liveMessage.value = 'Ocorreu um erro ao gerar o PDF.'
  } finally {
    showPreviewHeader.value = true
    isGenerating.value = false
    setTimeout(() => { successMessage.value = ''; liveMessage.value = '' }, 3500)
  }
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    element.focus({ preventScroll: true }) // Melhora acessibilidade
    isNavOpen.value = false // Fecha o menu após clicar
  }
}

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value
}
</script>

<template>
  <div>
    <!-- Navbar -->
    <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
      <div class="row gx-0">
        <div class="col-12">
          <NavbarDefault :sticky="true" />
        </div>
      </div>
    </div>

    <!-- Conteúdo Principal -->
    <div class="cv-generator">
      <br/><br/><br/><br/>
      <div class="container-fluid">
        <!-- Formulário -->
        <div class="form-container" role="form" aria-labelledby="cv-generator-title">
          <div class="header-section">
            <h1 id="cv-generator-title" class="main-title">Gerador de CV</h1>
            <p class="subtitle">Preencha os dados para criar seu currículo profissional</p>
            <button class="download-btn" @click="toggleExampleData" type="button">
              {{ isFilled ? 'Limpar Exemplo' : 'Preencher com Exemplo' }}
            </button>
          </div>

          <!-- Navigation Menu -->
          <nav class="section-nav" aria-label="Navegação entre seções">
            <button class="nav-toggle" @click="toggleNav" :aria-expanded="isNavOpen" aria-label="Alternar menu de navegação">
              <i class="fas" :class="isNavOpen ? 'fa-times' : 'fa-bars'"></i>
              <span>{{ isNavOpen ? '' : '' }}</span>
            </button>
            <ul v-show="isNavOpen" class="nav-list">
              <li><a href="#personal-info" @click.prevent="scrollToSection('personal-info')" class="nav-link">Dados Pessoais</a></li>
              <li><a href="#social-links" @click.prevent="scrollToSection('social-links')" class="nav-link">LinkedIn</a></li>
              <li><a href="#summary" @click.prevent="scrollToSection('summary')" class="nav-link">Sobre Mim</a></li>
              <li><a href="#experience" @click.prevent="scrollToSection('experience')" class="nav-link">Experiência</a></li>
              <li><a href="#education" @click.prevent="scrollToSection('education')" class="nav-link">Formação</a></li>
              <li><a href="#projects" @click.prevent="scrollToSection('projects')" class="nav-link">Projetos</a></li>
              <li><a href="#certifications" @click.prevent="scrollToSection('certifications')" class="nav-link">Certificações</a></li>
              <li><a href="#skills" @click.prevent="scrollToSection('skills')" class="nav-link">Competências</a></li>
              <li><a href="#languages" @click.prevent="scrollToSection('languages')" class="nav-link">Idiomas</a></li>
              <li><a href="#references" @click.prevent="scrollToSection('references')" class="nav-link">Referências</a></li>
            </ul>
          </nav>

          <!-- Feedback ao Vivo -->
          <div class="sr-only" aria-live="polite">{{ liveMessage }}</div>

          <!-- Alertas -->
          <div v-if="errorsList.length" class="alert alert-danger" role="alert" aria-live="assertive">
            <ul>
              <li v-for="(err, i) in errorsList" :key="i">{{ err }}</li>
            </ul>
          </div>
          <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">
            {{ successMessage }}
          </div>

          <!-- Upload de Foto -->
          <div class="photo-upload-container">
            <div v-if="photo" class="photo-preview">
              <img :src="photo" :alt="photoAlt" />
              <button class="remove-photo-btn" @click="removePhoto" aria-label="Remover foto" type="button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <label v-else class="photo-placeholder" aria-label="Carregar foto de perfil" tabindex="0" @keypress.enter="triggerPhotoUpload">
              <i class="fas fa-camera" aria-hidden="true"></i>
              <span>Upload Foto</span>
              <input ref="photoInput" type="file" class="photo-input" @change="onPhotoUpload" accept="image/*" aria-label="Selecionar imagem de perfil" />
            </label>
          </div>

          <!-- Dados Pessoais -->
          <h3 class="section-title" id="personal-info"><i class="fas fa-user" aria-hidden="true"></i> Dados Pessoais</h3>
          <div class="borda-destacada mb-2">
            <div class="form-floating mb-2">
              <input ref="nameInput" v-model="form.name" id="input-name" type="text" class="form-control-enhanced"
                     placeholder=" " aria-label="Nome completo" :aria-invalid="fieldErrors.name ? 'true' : 'false'"
                     :aria-describedby="fieldErrors.name ? 'error-name' : null" />
              <label for="input-name">Nome Completo *</label>
              <small v-if="fieldErrors.name" id="error-name" class="field-error" role="alert">{{ fieldErrors.name }}</small>
            </div>
            <div class="form-floating mb-2">
              <input v-model="form.title" id="input-title" type="text" class="form-control-enhanced" placeholder=" "
                     aria-label="Profissão" />
              <label for="input-title">Profissão</label>
            </div>
            <div class="form-floating mb-2">
              <input v-model="form.idNumber" id="input-bi" type="text" class="form-control-enhanced" placeholder=" "
                     aria-label="Número do Bilhete de Identidade" :aria-invalid="fieldErrors.idNumber ? 'true' : 'false'"
                     @input="debouncedBIInput" maxlength="20" :aria-describedby="fieldErrors.idNumber ? 'error-bi' : null" />
              <label for="input-bi">Número do Bilhete de Identidade</label>
              <small v-if="fieldErrors.idNumber" id="error-bi" class="field-error" role="alert">{{ fieldErrors.idNumber }}</small>
            </div>
            <div class="form-floating mb-2">
              <input v-model="form.birthDate" id="input-birth" type="date" class="form-control-enhanced" placeholder=" "
                     aria-label="Data de Nascimento" :aria-invalid="fieldErrors.birthDate ? 'true' : 'false'"
                     :aria-describedby="fieldErrors.birthDate ? 'error-birth' : null" />
              <label for="input-birth">Data de Nascimento</label>
              <small v-if="fieldErrors.birthDate" id="error-birth" class="field-error" role="alert">{{ fieldErrors.birthDate }}</small>
            </div>
            <div class="form-floating mb-2">
              <input ref="emailInput" v-model="form.email" id="input-email" type="text" class="form-control-enhanced" placeholder=" "
                     aria-label="Email" :aria-invalid="fieldErrors.email ? 'true' : 'false'"
                     :aria-describedby="fieldErrors.email ? 'error-email' : null" />
              <label for="input-email">Email *</label>
              <small v-if="fieldErrors.email" id="error-email" class="field-error" role="alert">{{ fieldErrors.email }}</small>
            </div>
            <div class="form-floating mb-2">
              <input ref="phoneInput" v-model="form.phone" id="input-phone" type="tel" class="form-control-enhanced" placeholder=" "
                     aria-label="Telefone" :aria-invalid="fieldErrors.phone ? 'true' : 'false'"
                     :aria-describedby="fieldErrors.phone ? 'error-phone' : null" @input="debouncedPhoneInput" maxlength="13" />
              <label for="input-phone">Telefone * (ex: 847 877 405)</label>
              <small v-if="fieldErrors.phone" id="error-phone" class="field-error" role="alert">{{ fieldErrors.phone }}</small>
            </div>
            <div class="form-floating mb-2">
              <input v-model="form.address" id="input-address" type="text" class="form-control-enhanced" placeholder=" "
                     aria-label="Endereço" />
              <label for="input-address">Endereço</label>
            </div>
          </div>

          <!-- Redes Sociais -->
          <h3 class="section-title" id="social-links"><i class="fas fa-link" aria-hidden="true"></i> LinkedIn</h3>
          <div class="borda-destacada mb-2">
            <div class="form-floating mb-2">
              <input v-model="form.socialLinks.linkedin" id="input-linkedin" type="url" class="form-control-enhanced" placeholder=" "
                     aria-label="Link do LinkedIn" :aria-invalid="fieldErrors.linkedin ? 'true' : 'false'"
                     :aria-describedby="fieldErrors.linkedin ? 'error-linkedin' : null" />
              <label for="input-linkedin">LinkedIn (opcional)</label>
              <small v-if="fieldErrors.linkedin" id="error-linkedin" class="field-error" role="alert">{{ fieldErrors.linkedin }}</small>
            </div>
          </div>

          <!-- Resumo -->
          <h3 class="section-title" id="summary"><i class="fas fa-align-left" aria-hidden="true"></i> Sobre Mim</h3>
          <div class="borda-destacada mb-2">
            <div class="form-floating">
              <textarea v-model="form.summary" id="input-summary" class="form-control-enhanced" placeholder=" "
                        aria-label="Resumo profissional"></textarea>
              <label for="input-summary">Resumo Profissional</label>
            </div>
          </div>

          <!-- Experiência -->
          <h3 class="section-title" id="experience"><i class="fas fa-briefcase" aria-hidden="true"></i> Experiência Profissional</h3>
          <div v-for="(exp, index) in form.experience" :key="index" class="borda-destacada mb-2">
            <div class="form-floating mb-1">
              <input v-model="exp.company" :id="'exp-company-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Empresa" />
              <label :for="'exp-company-' + index">Empresa</label>
            </div>
            <div class="form-floating mb-1">
              <input v-model="exp.role" :id="'exp-role-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Cargo" />
              <label :for="'exp-role-' + index">Cargo</label>
            </div>
            <div class="form-floating mb-1">
              <input v-model="exp.period" :id="'exp-period-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Período"
                     :aria-invalid="fieldErrors[`exp-period-${index}`] ? 'true' : 'false'" :aria-describedby="fieldErrors[`exp-period-${index}`] ? `error-exp-period-${index}` : null" />
              <label :for="'exp-period-' + index">Período</label>
              <small v-if="fieldErrors[`exp-period-${index}`]" :id="'error-exp-period-' + index" class="field-error" role="alert">{{ fieldErrors[`exp-period-${index}`] }}</small>
            </div>
            <div class="form-floating mb-1">
              <input v-model.number="exp.yearsExp" :id="'exp-years-' + index" type="number" min="0" class="form-control-enhanced" placeholder=" " aria-label="Anos de experiência" />
              <label :for="'exp-years-' + index">Anos de Experiência</label>
            </div>
            <div class="form-floating mb-1">
              <textarea v-model="exp.description" :id="'exp-desc-' + index" class="form-control-enhanced" placeholder=" " aria-label="Descrição da experiência"></textarea>
              <label :for="'exp-desc-' + index">Descrição</label>
            </div>
            <div class="actions-inline">
              <button class="remove-btn" @click="removeItem('experience', index)" @keypress.enter="removeItem('experience', index)" type="button" :aria-label="'Remover experiência ' + (index + 1)" tabindex="0">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('experience')" @keypress.enter="addItem('experience')" type="button" tabindex="0">+ Adicionar Experiência</button>

          <!-- Formação -->
          <h3 class="section-title" id="education"><i class="fas fa-graduation-cap" aria-hidden="true"></i> Formação Acadêmica</h3>
          <div v-for="(edu, index) in form.education" :key="index" class="borda-destacada mb-2">
            <div class="form-floating mb-1">
              <input v-model="edu.institution" :id="'edu-inst-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Instituição" />
              <label :for="'edu-inst-' + index">Instituição</label>
            </div>
            <div class="form-floating mb-1">
              <input v-model="edu.degree" :id="'edu-degree-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Curso" />
              <label :for="'edu-degree-' + index">Curso</label>
            </div>
            <div class="form-floating mb-1">
              <input v-model="edu.period" :id="'edu-period-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Ano de conclusão"
                     :aria-invalid="fieldErrors[`edu-period-${index}`] ? 'true' : 'false'" :aria-describedby="fieldErrors[`edu-period-${index}`] ? `error-edu-period-${index}` : null" />
              <label :for="'edu-period-' + index">Ano de Conclusão</label>
              <small v-if="fieldErrors[`edu-period-${index}`]" :id="'error-edu-period-' + index" class="field-error" role="alert">{{ fieldErrors[`edu-period-${index}`] }}</small>
            </div>
            <div class="actions-inline">
              <button class="remove-btn" @click="removeItem('education', index)" @keypress.enter="removeItem('education', index)" type="button" :aria-label="'Remover formação ' + (index + 1)" tabindex="0">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('education')" @keypress.enter="addItem('education')" type="button" tabindex="0">+ Adicionar Formação</button>

          <!-- Projetos -->
          <h3 class="section-title" id="projects"><i class="fas fa-project-diagram" aria-hidden="true"></i> Projetos</h3>
          <div v-for="(project, index) in form.projects" :key="index" class="borda-destacada mb-2">
            <div class="form-floating mb-1">
              <input v-model="project.name" :id="'project-name-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Nome do projeto" />
              <label :for="'project-name-' + index">Nome do Projeto</label>
            </div>
            <div class="form-floating mb-1">
              <textarea v-model="project.description" :id="'project-desc-' + index" class="form-control-enhanced" placeholder=" " aria-label="Descrição do projeto"></textarea>
              <label :for="'project-desc-' + index">Descrição</label>
            </div>
            <div class="form-floating mb-1">
              <input v-model="project.period" :id="'project-period-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Período"
                     :aria-invalid="fieldErrors[`project-period-${index}`] ? 'true' : 'false'" :aria-describedby="fieldErrors[`project-period-${index}`] ? `error-project-period-${index}` : null" />
              <label :for="'project-period-' + index">Período</label>
              <small v-if="fieldErrors[`project-period-${index}`]" :id="'error-project-period-' + index" class="field-error" role="alert">{{ fieldErrors[`project-period-${index}`] }}</small>
            </div>
            <div class="form-floating mb-1">
              <input v-model="project.technologies" :id="'project-tech-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Tecnologias utilizadas" />
              <label :for="'project-tech-' + index">Tecnologias Utilizadas</label>
            </div>
            <div class="form-floating mb-1">
              <input v-model="project.link" :id="'project-link-' + index" type="url" class="form-control-enhanced" placeholder=" " aria-label="Link do projeto"
                     :aria-invalid="fieldErrors[`project-link-${index}`] ? 'true' : 'false'" :aria-describedby="fieldErrors[`project-link-${index}`] ? `error-project-link-${index}` : null" />
              <label :for="'project-link-' + index">Link (opcional)</label>
              <small v-if="fieldErrors[`project-link-${index}`]" :id="'error-project-link-' + index" class="field-error" role="alert">{{ fieldErrors[`project-link-${index}`] }}</small>
            </div>
            <div class="actions-inline">
              <button class="remove-btn" @click="removeItem('projects', index)" @keypress.enter="removeItem('projects', index)" type="button" :aria-label="'Remover projeto ' + (index + 1)" tabindex="0">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('projects')" @keypress.enter="addItem('projects')" type="button" tabindex="0">+ Adicionar Projeto</button>

          <!-- Certificações -->
          <h3 class="section-title" id="certifications"><i class="fas fa-certificate" aria-hidden="true"></i> Certificações</h3>
          <div v-for="(cert, index) in form.certifications" :key="index" class="borda-destacada mb-2">
            <div class="form-floating mb-1">
              <input v-model="cert.name" :id="'cert-name-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Nome do certificado" />
              <label :for="'cert-name-' + index">Nome do Certificado</label>
            </div>
            <div class="form-floating mb-1">
              <input v-model="cert.institution" :id="'cert-inst-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Instituição" />
              <label :for="'cert-inst-' + index">Instituição</label>
            </div>
            <div class="form-floating mb-1">
              <input v-model="cert.date" :id="'cert-date-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Data de emissão"
                     :aria-invalid="fieldErrors[`cert-date-${index}`] ? 'true' : 'false'" :aria-describedby="fieldErrors[`cert-date-${index}`] ? `error-cert-date-${index}` : null" />
              <label :for="'cert-date-' + index">Data de Emissão</label>
              <small v-if="fieldErrors[`cert-date-${index}`]" :id="'error-cert-date-' + index" class="field-error" role="alert">{{ fieldErrors[`cert-date-${index}`] }}</small>
            </div>
            <div class="form-floating mb-1">
              <input v-model="cert.link" :id="'cert-link-' + index" type="url" class="form-control-enhanced" placeholder=" " aria-label="Link do certificado"
                     :aria-invalid="fieldErrors[`cert-link-${index}`] ? 'true' : 'false'" :aria-describedby="fieldErrors[`cert-link-${index}`] ? `error-cert-link-${index}` : null" />
              <label :for="'cert-link-' + index">Link (opcional)</label>
              <small v-if="fieldErrors[`cert-link-${index}`]" :id="'error-cert-link-' + index" class="field-error" role="alert">{{ fieldErrors[`cert-link-${index}`] }}</small>
            </div>
            <div class="actions-inline">
              <button class="remove-btn" @click="removeItem('certifications', index)" @keypress.enter="removeItem('certifications', index)" type="button" :aria-label="'Remover certificação ' + (index + 1)" tabindex="0">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('certifications')" @keypress.enter="addItem('certifications')" type="button" tabindex="0">+ Adicionar Certificação</button>

          <!-- Competências -->
          <h3 class="section-title" id="skills"><i class="fas fa-star" aria-hidden="true"></i> Competências</h3>
          <div v-for="(skill, index) in form.skills" :key="index" class="borda-destacada mb-2">
            <div class="form-floating mb-1">
              <input v-model="form.skills[index]" :id="'skill-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Competência" />
              <label :for="'skill-' + index">Competência</label>
            </div>
            <div class="actions-inline">
              <button class="remove-btn" @click="removeItem('skills', index)" @keypress.enter="removeItem('skills', index)" type="button" :aria-label="'Remover competência ' + (index + 1)" tabindex="0">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('skills')" @keypress.enter="addItem('skills')" type="button" tabindex="0">+ Adicionar Competência</button>

          <!-- Idiomas -->
          <h3 class="section-title" id="languages"><i class="fas fa-language" aria-hidden="true"></i> Idiomas</h3>
          <div v-for="(lang, index) in form.languages" :key="index" class="borda-destacada mb-2">
            <div class="form-floating mb-1">
              <input list="languages" v-model="form.languages[index].language" :id="'lang-' + index" class="form-control-enhanced" placeholder=" " aria-label="Idioma" />
              <datalist id="languages">
                <option v-for="l in languageOptions" :key="l" :value="l">{{ l }}</option>
              </datalist>
              <label :for="'lang-' + index">Idioma</label>
            </div>
            <div class="form-floating mb-1">
              <input list="levels" v-model="form.languages[index].level" :id="'lang-level-' + index" class="form-control-enhanced" placeholder=" " aria-label="Nível" />
              <datalist id="levels">
                <option v-for="lvl in levelOptions" :key="lvl" :value="lvl">{{ lvl }}</option>
              </datalist>
              <label :for="'lang-level-' + index">Nível</label>
            </div>
            <div class="actions-inline">
              <button class="remove-btn" @click="removeItem('languages', index)" @keypress.enter="removeItem('languages', index)" type="button" :aria-label="'Remover idioma ' + (index + 1)" tabindex="0">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('languages')" @keypress.enter="addItem('languages')" type="button" tabindex="0">+ Adicionar Idioma</button>

          <!-- Referências -->
          <h3 class="section-title" id="references"><i class="fas fa-users" aria-hidden="true"></i> Referências</h3>
          <div v-for="(reference, index) in form.references" :key="index" class="borda-destacada mb-2">
            <div class="form-floating mb-1">
              <input v-model="reference.name" :id="'ref-name-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Nome da referência" />
              <label :for="'ref-name-' + index">Nome</label>
            </div>
            <div class="form-floating mb-1">
              <input v-model="reference.role" :id="'ref-role-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Cargo da referência" />
              <label :for="'ref-role-' + index">Profissão</label>
            </div>
            <div class="actions-inline">
              <button class="remove-btn" @click="removeItem('references', index)" @keypress.enter="removeItem('references', index)" type="button" :aria-label="'Remover referência ' + (index + 1)" tabindex="0">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('references')" @keypress.enter="addItem('references')" type="button" tabindex="0">+ Adicionar Referência</button>

          <!-- Ações -->
          <div class="actions-block">
            <button class="reset-btn" @click="resetForm" type="button">Resetar Formulário</button>
            <button class="download-btn" @click="generateCV" type="button" :disabled="isGenerating">
              <i class="fas fa-file-download" aria-hidden="true"></i>
              {{ isGenerating ? 'Gerando...' : 'Gerar CV' }}
            </button>
          </div>
        </div>

        <!-- Visualização -->
        <div class="preview-container" id="cv-preview" aria-live="polite">
          <div class="preview-header" v-show="showPreviewHeader">
            <h2 class="preview-title"><i class="fas fa-eye" aria-hidden="true"></i> Pré-visualização</h2>
          </div>
          <div class="cv-preview">
            <div class="cv-document">
              <div class="cv-header">
                <div class="header-content">
                  <div class="profile-section">
                    <div v-if="photo" class="profile-photo">
                      <img :src="photo" :alt="photoAlt" />
                    </div>
                    <div class="profile-info">
                      <h1 class="cv-name">{{ form.name || "Seu Nome" }}</h1>
                      <h2 class="cv-title">{{ form.title || "Profissão" }}</h2>
                    </div>
                  </div>
                  <div class="contact-info">
                    <div class="contact-item"><i class="fas fa-id-card" aria-hidden="true"></i> {{ form.idNumber || 'Não informado' }}</div>
                    <div class="contact-item"><i class="fas fa-birthday-cake" aria-hidden="true"></i> {{ formattedBirthDate || 'Não informado' }}</div>
                    <div class="contact-item"><i class="fas fa-envelope" aria-hidden="true"></i> {{ form.email || 'Não informado' }}</div>
                    <div class="contact-item"><i class="fas fa-phone" aria-hidden="true"></i> {{ form.phone || 'Não informado' }}</div>
                    <div class="contact-item"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> {{ form.address || 'Não informado' }}</div>
                    <div class="social-links" v-if="hasSocialLinks">
                      <a v-if="form.socialLinks.linkedin" :href="form.socialLinks.linkedin" target="_blank" class="social-link" :aria-label="'Perfil do LinkedIn de ' + socialNames.linkedin">
                        <i class="fab fa-linkedin"></i> {{ socialNames.linkedin || 'LinkedIn' }}
                      </a>
                      <a v-if="form.socialLinks.facebook" :href="form.socialLinks.facebook" target="_blank" class="social-link" :aria-label="'Perfil do Facebook de ' + socialNames.facebook">
                        <i class="fab fa-facebook"></i> {{ socialNames.facebook || 'Facebook' }}
                      </a>
                      <a v-if="form.socialLinks.instagram" :href="form.socialLinks.instagram" target="_blank" class="social-link" :aria-label="'Perfil do Instagram de ' + socialNames.instagram">
                        <i class="fab fa-instagram"></i> {{ socialNames.instagram || 'Instagram' }}
                      </a>
                      <a v-if="form.socialLinks.website" :href="form.socialLinks.website" target="_blank" class="social-link" :aria-label="'Website pessoal de ' + socialNames.website">
                        <i class="fas fa-globe"></i> {{ socialNames.website || 'Website' }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div class="cv-body">
                <!-- Sobre Mim -->
                <div class="cv-section" v-if="form.summary">
                  <h3 class="section-title-cv"><i class="fas fa-align-left" aria-hidden="true"></i> Sobre Mim</h3>
                  <p class="resume-text">{{ form.summary }}</p>
                </div>
                <hr class="section-divider" v-if="form.summary && (form.experience.length || form.education.length || form.projects.length || form.certifications.length || form.skills.length || form.languages.length || form.references.length)">

                <!-- Experiência Profissional -->
                <div class="cv-section" v-if="form.experience.length">
                  <h3 class="section-title-cv"><i class="fas fa-briefcase" aria-hidden="true"></i> Experiência Profissional</h3>
                  <div class="timeline">
                    <div v-for="(exp, i) in sortedExperience" :key="'preview-exp-' + i" class="timeline-item">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <h4 class="timeline-title">{{ exp.role || 'Cargo' }}</h4>
                        <p class="resume-text"><strong>{{ exp.company || 'Empresa' }}</strong> - {{ exp.period || 'Período' }} ({{ exp.yearsExp || 0 }} anos)</p>
                        <p class="resume-text">{{ exp.description || 'Sem descrição' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <hr class="section-divider" v-if="form.experience.length && (form.education.length || form.projects.length || form.certifications.length || form.skills.length || form.languages.length || form.references.length)">

                <!-- Formação Acadêmica -->
                <div class="cv-section" v-if="form.education.length">
                  <h3 class="section-title-cv"><i class="fas fa-graduation-cap" aria-hidden="true"></i> Formação Acadêmica</h3>
                  <div class="timeline">
                    <div v-for="(edu, i) in sortedEducation" :key="'preview-edu-' + i" class="timeline-item">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <h4 class="timeline-title">{{ edu.degree || 'Curso' }}</h4>
                        <p class="resume-text"><strong>{{ edu.institution || 'Instituição' }}</strong> - {{ edu.period || 'Período' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <hr class="section-divider" v-if="form.education.length && (form.projects.length || form.certifications.length || form.skills.length || form.languages.length || form.references.length)">

                <!-- Projetos -->
                <div class="cv-section" v-if="form.projects.length">
                  <h3 class="section-title-cv"><i class="fas fa-project-diagram" aria-hidden="true"></i> Projetos</h3>
                  <div class="timeline">
                    <div v-for="(project, i) in sortedProjects" :key="'preview-project-' + i" class="timeline-item">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <h4 class="timeline-title">{{ project.name || 'Projeto' }}</h4>
                        <p class="resume-text"><strong>{{ project.technologies || 'Tecnologias' }}</strong> - {{ project.period || 'Período' }}</p>
                        <p class="resume-text">{{ project.description || 'Sem descrição' }}</p>
                        <a v-if="project.link" :href="project.link" target="_blank" class="project-link">{{ project.link }}</a>
                      </div>
                    </div>
                  </div>
                </div>
                <hr class="section-divider" v-if="form.projects.length && (form.certifications.length || form.skills.length || form.languages.length || form.references.length)">

                <!-- Certificações -->
                <div class="cv-section" v-if="form.certifications.length">
                  <h3 class="section-title-cv"><i class="fas fa-certificate" aria-hidden="true"></i> Certificações</h3>
                  <ul class="resume-text certification-list">
                    <li v-for="(cert, i) in sortedCertifications" :key="'preview-cert-' + i" class="certification-item">
                      {{ cert.name || 'Certificado' }} - <strong>{{ cert.institution || 'Instituição' }}</strong> ({{ cert.date || 'Data' }})
                      <a v-if="cert.link" :href="cert.link" target="_blank" class="cert-link">{{ cert.link }}</a>
                    </li>
                  </ul>
                </div>
                <hr class="section-divider" v-if="form.certifications.length && (form.skills.length || form.languages.length || form.references.length)">

                <!-- Competências -->
                <div class="cv-section" v-if="form.skills.length">
                  <h3 class="section-title-cv"><i class="fas fa-star" aria-hidden="true"></i> Competências</h3>
                  <ul class="resume-text skill-list">
                    <li v-for="(skill, i) in form.skills" :key="'preview-skill-' + i" class="skill-item">{{ skill || 'Competência' }}</li>
                  </ul>
                </div>
                <hr class="section-divider" v-if="form.skills.length && (form.languages.length || form.references.length)">

                <!-- Idiomas -->
                <div class="cv-section" v-if="form.languages.length">
                  <h3 class="section-title-cv"><i class="fas fa-language" aria-hidden="true"></i> Idiomas</h3>
                  <ul class="resume-text language-list">
                    <li v-for="(lang, i) in form.languages" :key="'preview-lang-' + i" class="language-item">{{ lang.language || 'Idioma' }} - {{ lang.level || 'Nível' }}</li>
                  </ul>
                </div>
                <hr class="section-divider" v-if="form.languages.length && form.references.length">

                <!-- Referências -->
                <div class="cv-section" v-if="form.references.length">
                  <h3 class="section-title-cv"><i class="fas fa-users" aria-hidden="true"></i> Referências</h3>
                  <ul class="resume-text">
                    <li v-for="(ref, i) in form.references" :key="'preview-ref-' + i">
                      {{ ref.name || 'Nome' }} - {{ ref.role || 'Cargo' }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="cv-footer">
                <img :src="logo" alt="Logotipo rPa" class="footer-logo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <FooterDefault />
  </div>
</template>

<style scoped>
/* Importação de Fonte */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

/* Estilos Gerais */
* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}

.cv-generator {
  background: #f8fafc;
  min-height: 100vh;
  padding: 1rem;
  width: 100vw;
  overflow-x: hidden;
}

.container-fluid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .container-fluid {
    flex-direction: row;
    gap: 1.5rem;
    padding: 0 1.5rem;
  }
}

@media (min-width: 992px) {
  .container-fluid {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 2rem;
    padding: 0 2rem;
  }
}

/* Estilos do Formulário */
.form-container {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-container:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.header-section {
  text-align: center;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.main-title {
  font-size: clamp(1.5rem, 5vw, 1.75rem);
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.main-title:hover {
  color: #3b82f6;
}

.subtitle {
  font-size: clamp(0.9rem, 3.5vw, 1rem);
  color: #4b5563;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
}

.alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  font-size: clamp(0.85rem, 3.5vw, 0.95rem);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.alert-danger {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #f87171;
}

.alert-success {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.photo-upload-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.photo-placeholder {
  width: clamp(80px, 20vw, 90px);
  height: clamp(80px, 20vw, 90px);
  border: 2px dashed #9ca3af;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #6b7280;
  cursor: pointer;
  transition: border-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
  padding: 0.5rem;
}

.photo-placeholder:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: scale(1.05);
}

.photo-placeholder i {
  font-size: clamp(20px, 5vw, 22px);
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
}

.photo-placeholder:hover i {
  transform: rotate(10deg);
}

.photo-placeholder span {
  font-size: clamp(12px, 3.5vw, 13px);
  text-align: center;
  line-height: 1.3;
}

.photo-input {
  display: none;
}

.photo-preview {
  position: relative;
  width: clamp(80px, 20vw, 90px);
  height: clamp(80px, 20vw, 90px);
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #3b82f6;
  transition: border-color 0.3s ease, transform 0.3s ease;
}

.photo-preview:hover {
  transform: scale(1.03);
  border-color: #1e40af;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  padding: 5px 7px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
  font-size: clamp(12px, 3vw, 13px);
}

.remove-photo-btn:hover {
  background: rgba(185, 28, 28, 0.9);
  transform: scale(1.1);
}

.form-floating {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-control-enhanced {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #66bb6a;
  border-radius: 5px;
  outline: none;
  font-size: clamp(0.9rem, 3.5vw, 1rem);
  line-height: 1.5;
  background: #f8fafc;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}

.form-control-enhanced:hover {
  transform: scale(1.02);
}

.form-control-enhanced:focus {
  border-color: #800080;
  box-shadow: 0 0 0 0.2rem rgba(102, 16, 242, 0.25);
  transform: scale(1.02);
}

.form-floating label {
  position: absolute;
  top: 50%;
  left: 1.5rem;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: clamp(0.95rem, 3.5vw, 1.05rem);
  font-weight: 400;
  padding: 0.1rem 0.3rem;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.3s ease, visibility 0.3s ease, color 0.3s ease, top 0.3s ease, transform 0.3s ease;
}

.form-control-enhanced:focus + label,
.form-control-enhanced:not(:placeholder-shown) + label {
  opacity: 0;
  visibility: hidden;
}

textarea.form-control-enhanced {
  min-height: 100px;
  resize: vertical;
  padding: 0.625rem;
}

.borda-destacada {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1.25rem;
  background: #f9fafb;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 1.5rem;
}

.borda-destacada:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.add-btn, .remove-btn, .download-btn, .reset-btn {
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  font-size: clamp(0.9rem, 3.5vw, 1rem);
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.add-btn {
  background: #16a34a;
  color: white;
  width: 100%;
}

.add-btn:hover {
  background: #15803d;
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.remove-btn {
  background: #b91c1c;
  color: white;
  padding: 0.5rem 1rem;
}

.remove-btn:hover {
  background: #991b1b;
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.download-btn {
  background: #1e40af;
  color: white;
  padding: 0.75rem 1.5rem;
}

.download-btn:hover {
  background: #1e3a8a;
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.download-btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-btn {
  background: #f59e0b;
  color: white;
}

.reset-btn:hover {
  background: #d97706;
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

/* Botões de Ação */
.actions-block {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.actions-inline {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

/* Estilos da Visualização do CV */
.preview-container {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.preview-container:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.preview-title {
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.preview-title:hover {
  color: #3b82f6;
}

.cv-preview {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.cv-preview:hover {
  border-color: #3b82f6;
}

@media (min-width: 768px) {
  .cv-preview {
    max-width: 210mm;
  }
}

.cv-document {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: clamp(7pt, 2vw, 8pt);
}

.cv-header {
  background: #1e40af;
  color: white;
  padding: 4mm 6mm;
  max-height: 40mm;
  page-break-after: avoid;
  transition: background 0.3s ease;
}

.cv-header:hover {
  background: #1e3a8a;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 2mm;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .header-content {
    max-width: 194mm;
  }
}

.profile-section {
  display: flex;
  align-items: flex-start;
  gap: 2mm;
  flex: 1;
  max-height: 40mm;
}

.profile-photo {
  width: clamp(16mm, 8vw, 18mm);
  height: clamp(16mm, 8vw, 18mm);
  border-radius: 50%;
  overflow: hidden;
  border: 0.5mm solid white;
  flex-shrink: 0;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.profile-photo:hover {
  transform: scale(1.03);
  border-color: #e0e7ff;
}

.profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.cv-name {
  font-size: clamp(12pt, 3.5vw, 14pt);
  font-weight: 700;
  margin: 0;
  color: white;
  line-height: 1.2;
  transition: transform 0.3s ease;
}

.cv-name:hover {
  transform: translateX(2px);
}

.cv-title {
  font-size: clamp(9pt, 3vw, 11pt);
  font-weight: 500;
  margin: 1mm 0 0;
  color: white;
  line-height: 1.2;
  transition: transform 0.3s ease;
}

.cv-title:hover {
  transform: translateX(2px);
}

.contact-info {
  text-align: right;
  font-size: clamp(7pt, 2vw, 8pt);
  flex: 1;
  max-height: 40mm;
}

.contact-item {
  margin: 0.25mm 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5mm;
  transition: transform 0.3s ease;
}

.contact-item:hover {
  transform: translateX(2px);
}

.contact-item i {
  font-size: clamp(6pt, 1.5vw, 7pt);
}

.social-links {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5mm;
  margin-top: 1mm;
}

.social-link {
  color: white;
  font-size: clamp(8pt, 2vw, 9pt);
  display: flex;
  align-items: center;
  gap: 0.5mm;
  text-decoration: none;
  transition: color 0.3s ease, transform 0.3s ease;
}

.social-link:hover {
  color: #e0e7ff;
  transform: translateX(2px);
}

.social-link i {
  font-size: clamp(8pt, 2vw, 9pt);
}

.cv-body {
  padding: 4mm 6mm;
  color: #1f2937;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  flex: 1;
}

@media (min-width: 768px) {
  .cv-body {
    max-width: 194mm;
  }
}

.cv-section {
  margin-bottom: 1.5mm;
  page-break-inside: avoid;
  page-break-after: auto;
  transition: transform 0.3s ease;
}

.cv-section:hover {
  transform: translateY(-1px);
}

.section-title-cv {
  font-size: clamp(10pt, 3vw, 11pt);
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.75mm;
  display: flex;
  align-items: center;
  gap: 0.5mm;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.section-title-cv:hover {
  color: #3b82f6;
}

.section-title-cv i {
  font-size: clamp(8pt, 2vw, 9pt);
  transition: transform 0.3s ease;
}

.section-title-cv:hover i {
  transform: rotate(10deg);
}

.section-divider {
  border: none;
  height: 1px;
  background-color: #1e3a8a;
  margin: 1mm 0;
  page-break-inside: avoid;
  transition: background-color 0.3s ease;
}

.section-divider:hover {
  background-color: #3b82f6;
}

.resume-text {
  font-size: clamp(7pt, 2vw, 8pt);
  line-height: 1.3;
  color: #374151;
}

.resume-text.skill-list, .resume-text.language-list, .resume-text.certification-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1mm;
  padding: 0;
  margin: 0.25mm 0;
  list-style: none;
}

.skill-item, .language-item, .certification-item {
  border: 1px solid #1e3a8a;
  border-radius: 1.5mm;
  padding: 0.5mm 2mm;
  font-size: clamp(7pt, 2vw, 8pt);
  color: #374151;
  background: #f8fafc;
  transition: transform 0.3s ease, background 0.3s ease;
}

.skill-item:hover, .language-item:hover, .certification-item:hover {
  transform: scale(1.02);
  background: #e0e7ff;
}

.certification-item {
  width: 100%;
  border: none;
  padding: 0;
  background: none;
}

.project-link, .cert-link {
  color: #1e3a8a;
  font-size: clamp(7pt, 2vw, 8pt);
  text-decoration: none;
  display: block;
  margin-top: 0.25mm;
  transition: color 0.3s ease, transform 0.3s ease;
}

.project-link:hover, .cert-link:hover {
  color: #3b82f6;
  transform: translateX(2px);
}

.timeline {
  position: relative;
  margin-left: 4mm;
  padding-left: 4mm;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 2mm;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #1e3a8a;
  transition: background-color 0.3s ease;
}

.timeline:hover::before {
  background-color: #3b82f6;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5mm;
  padding-left: 4mm;
  page-break-inside: avoid;
  transition: transform 0.3s ease;
}

.timeline-item:hover {
  transform: translateX(2px);
}

.timeline-marker {
  position: absolute;
  left: -1mm;
  top: 1mm;
  width: 2mm;
  height: 2mm;
  background-color: #1e3a8a;
  border-radius: 50%;
  border: 0.5mm solid white;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.timeline-item:hover .timeline-marker {
  background-color: #3b82f6;
  transform: scale(1.2);
}

.timeline-content p.resume-text {
  max-height: 8mm;
  overflow: hidden;
}

.timeline-title {
  font-size: clamp(9pt, 2.5vw, 10pt);
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25mm;
  transition: color 0.3s ease;
}

.timeline-title:hover {
  color: #3b82f6;
}

/* Rodapé com Logotipo */
.cv-footer {
  padding: 3mm 6mm;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-top: auto;
  min-height: 5mm;
  page-break-before: avoid;
}

.footer-logo {
  width: clamp(7mm, 4vw, 8mm);
  height: auto;
  transition: transform 0.3s ease;
}

.footer-logo:hover {
  transform: rotate(5deg);
}

/* Erros de Campo */
.field-error {
  color: #b91c1c;
  display: block;
  margin-top: 0.5rem;
  font-size: clamp(0.8rem, 3vw, 0.9rem);
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

/* Animações */
@keyframes fadeInUp {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.form-container, .preview-container {
  animation: fadeInUp 0.4s ease;
}

/* Acessibilidade */
:focus {
  outline: 2px solid rgba(59, 130, 246, 0.3);
  outline-offset: 1px;
}

/* Estilos para Impressão (PDF) */
@media print {
  .cv-preview {
    width: 210mm;
    margin: 0;
    padding: 0;
    border: none;
    box-shadow: none;
  }

  .cv-document {
    width: 100%;
  }

  .cv-header {
    page-break-after: avoid;
  }

  .cv-body {
    page-break-inside: auto;
  }

  .cv-section,
  .timeline-item {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  .section-divider {
    page-break-inside: avoid;
  }

  .cv-footer {
    page-break-before: avoid;
  }

  .preview-header {
    display: none;
  }

  .social-link, .project-link, .cert-link {
    color: white !important;
  }

  .timeline::before,
  .timeline-marker {
    background-color: #1e3a8a !important;
  }

  .skill-item, .language-item, .certification-item {
    border: 1px solid #1e3a8a !important;
    background: #f8fafc !important;
  }

  .section-nav {
    display: none; /* Oculta o menu flutuante na impressão */
  }
}

/* Estilos do Menu de Navegação */
.section-nav {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000; /* Aumentado para garantir que fique acima de outros elementos */
  margin-bottom: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.nav-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: auto;
  padding: 0.5rem 1rem; /* Reduzido para tornar o botão menor */
  background-color: #1e40af;
  color: #fff;
  border: none;
  border-radius: 50px; /* Bordas mais arredondadas para um look flutuante */
  font-size: clamp(0.85rem, 3vw, 0.9rem); /* Fonte menor */
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Sombra mais pronunciada para efeito flutuante */
}

.nav-toggle:hover,
.nav-toggle:focus {
  background-color: #1e3a8a;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}

.nav-toggle:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.nav-toggle i {
  font-size: clamp(0.9rem, 3vw, 1rem); /* Ícone menor */
  transition: transform 0.3s ease;
}

.nav-toggle:hover i {
  transform: scale(1.1);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.4s ease, opacity 0.3s ease, margin-top 0.3s ease;
  width: 100%;
  max-width: 280px; /* Reduzido para combinar com o botão menor */
  position: absolute;
  bottom: 50px; /* Posiciona a lista acima do botão */
  right: 0;
}

.nav-list.show {
  max-height: 600px;
  opacity: 1;
  margin-top: 0.75rem;
}

.nav-list li {
  border-bottom: 1px solid #e5e7eb;
}

.nav-list li:last-child {
  border-bottom: none;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #1f2937;
  font-weight: 500;
  font-size: clamp(0.9rem, 3.5vw, 0.95rem);
  padding: 0.85rem 1.5rem;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.nav-link:hover,
.nav-link:focus {
  background-color: #f1f5f9;
  color: #3b82f6;
  transform: translateX(4px);
}

.nav-link:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.nav-link::before {
  content: '\f054';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  font-size: 0.8rem;
  color: #6b7280;
  transition: color 0.2s ease;
}

.nav-link:hover::before,
.nav-link:focus::before {
  color: #3b82f6;
}

/* Ajustes responsivos */
@media (min-width: 768px) {
  .section-nav {
    position: sticky;
    top: 80px;
    bottom: auto;
    right: auto;
    justify-content: flex-start;
  }

  .nav-toggle {
    width: auto;
    padding: 0.5rem 1rem;
    border-radius: 6px; /* Bordas menos arredondadas em desktop */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .nav-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    max-height: none;
    opacity: 1;
    margin-top: 0;
    box-shadow: none;
    background: transparent;
    max-width: none;
    position: static;
  }

  .nav-list.show {
    max-height: none;
  }

  .nav-list li {
    border-bottom: none;
  }

  .nav-link {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: clamp(0.85rem, 3vw, 0.9rem);
  }

  .nav-link:hover,
  .nav-link:focus {
    background-color: #e0e7ff;
    transform: scale(1.03);
  }

  .nav-link::before {
    display: none;
  }
}

@media (max-width: 767px) {
  .nav-list {
    flex-direction: column;
  }
}

/* Ajustes para Mobile */
@media (max-width: 576px) {
  .cv-generator {
    padding: 0.5rem;
  }

  .container-fluid {
    padding: 0 0.5rem;
    gap: 0.75rem;
  }

  .form-container {
    padding: 1rem;
  }

  .header-section {
    margin-bottom: 1rem;
  }

  .main-title {
    font-size: clamp(1.25rem, 4.5vw, 1.5rem);
  }

  .subtitle {
    font-size: clamp(0.85rem, 3.5vw, 0.9rem);
    margin-bottom: 0.75rem;
  }

  .alert {
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.75rem;
  }

  .photo-upload-container {
    margin-bottom: 1rem;
  }

  .photo-placeholder, .photo-preview {
    width: clamp(70px, 18vw, 80px);
    height: clamp(70px, 18vw, 80px);
  }

  .photo-placeholder i {
    font-size: clamp(18px, 4.5vw, 20px);
  }

  .photo-placeholder span {
    font-size: clamp(11px, 3vw, 12px);
  }

  .remove-photo-btn {
    padding: 4px 6px;
    font-size: clamp(11px, 2.5vw, 12px);
  }

  .form-floating {
    margin-bottom: 1.25rem;
  }

  .form-control-enhanced {
    font-size: clamp(0.85rem, 3.5vw, 0.95rem);
    padding: 0.625rem;
  }

  .form-floating label {
    font-size: clamp(0.9rem, 3.5vw, 1rem);
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
  }

  textarea.form-control-enhanced {
    min-height: 80px;
  }

  .borda-destacada {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .add-btn, .remove-btn, .download-btn, .reset-btn {
    font-size: clamp(0.85rem, 3.5vw, 0.95rem);
    padding: 0.5rem 1rem;
  }

  .actions-block {
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .actions-inline {
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .preview-container {
    padding: 1rem;
  }

  .preview-title {
    font-size: clamp(1rem, 3.5vw, 1.25rem);
    margin-bottom: 0.75rem;
  }

  .cv-header {
    padding: 3mm 4mm;
  }

  .cv-body {
    padding: 3mm 4mm;
  }

  .cv-name {
    font-size: clamp(11pt, 3vw, 12pt);
  }

  .cv-title {
    font-size: clamp(8pt, 2.5vw, 10pt);
  }

  .contact-info {
    font-size: clamp(6pt, 1.5vw, 7pt);
  }

  .social-link {
    font-size: clamp(7pt, 1.5vw, 8pt);
  }

  .social-link i {
    font-size: clamp(7pt, 1.5vw, 8pt);
  }

  .section-title-cv {
    font-size: clamp(9pt, 2.5vw, 10pt);
  }

  .section-title-cv i {
    font-size: clamp(7pt, 1.5vw, 8pt);
  }

  .resume-text {
    font-size: clamp(6pt, 1.5vw, 7pt);
  }

  .timeline-title {
    font-size: clamp(8pt, 2vw, 9pt);
  }

  .skill-item, .language-item, .certification-item {
    font-size: clamp(6pt, 1.5vw, 7pt);
  }

  .footer-logo {
    width: clamp(6mm, 3.5vw, 7mm);
  }

  .section-nav {
    bottom: 15px;
    right: 15px;
  }

  .nav-toggle {
    padding: 0.4rem 0.8rem; /* Ainda menor em mobile */
    font-size: clamp(0.8rem, 3vw, 0.85rem);
  }

  .nav-list {
    max-width: 240px; /* Ajustado para mobile */
  }

  .nav-link {
    font-size: clamp(0.85rem, 3.5vw, 0.9rem);
    padding: 0.75rem 1.25rem;
  }
}
</style>