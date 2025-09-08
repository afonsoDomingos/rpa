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
          <h3 class="section-title"><i class="fas fa-user" aria-hidden="true"></i> Dados Pessoais</h3>
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
              <input ref="emailInput" v-model="form.email" id="input-email" type="email" class="form-control-enhanced" placeholder=" "
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
          <h3 class="section-title"><i class="fas fa-link" aria-hidden="true"></i> Linkedin</h3>
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
          <h3 class="section-title"><i class="fas fa-align-left" aria-hidden="true"></i> Sobre Mim</h3>
          <div class="borda-destacada mb-2">
            <div class="form-floating">
              <textarea v-model="form.summary" id="input-summary" class="form-control-enhanced" placeholder=" "
                        aria-label="Resumo profissional"></textarea>
              <label for="input-summary">Resumo Profissional</label>
            </div>
          </div>

          <!-- Experiência -->
          <h3 class="section-title"><i class="fas fa-briefcase" aria-hidden="true"></i> Experiência Profissional</h3>
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
              <input v-model="exp.period" :id="'exp-period-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Período" />
              <label :for="'exp-period-' + index">Período</label>
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
              <button class="remove-btn" @click="removeItem('experience', index)" type="button" :aria-label="'Remover experiência ' + (index + 1)">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('experience')" type="button">+ Adicionar Experiência</button>

          <!-- Formação -->
          <h3 class="section-title"><i class="fas fa-graduation-cap" aria-hidden="true"></i> Formação Acadêmica</h3>
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
              <input v-model="edu.period" :id="'edu-period-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Ano de conclusão" />
              <label :for="'edu-period-' + index">Ano de Conclusão</label>
            </div>
            <div class="form-floating mb-1">
              <textarea v-model="edu.description" :id="'edu-desc-' + index" class="form-control-enhanced" placeholder=" " aria-label="Descrição da formação"></textarea>
              <label :for="'edu-desc-' + index">Descrição</label>
            </div>
            <div class="actions-inline">
              <button class="remove-btn" @click="removeItem('education', index)" type="button" :aria-label="'Remover formação ' + (index + 1)">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('education')" type="button">+ Adicionar Formação</button>

          <!-- Competências -->
          <h3 class="section-title"><i class="fas fa-star" aria-hidden="true"></i> Competências</h3>
          <div v-for="(skill, index) in form.skills" :key="index" class="borda-destacada mb-2">
            <div class="form-floating mb-1">
              <input v-model="form.skills[index]" :id="'skill-' + index" type="text" class="form-control-enhanced" placeholder=" " aria-label="Competência" />
              <label :for="'skill-' + index">Competência</label>
            </div>
            <div class="actions-inline">
              <button class="remove-btn" @click="removeItem('skills', index)" type="button" :aria-label="'Remover competência ' + (index + 1)">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('skills')" type="button">+ Adicionar Competência</button>

          <!-- Idiomas -->
          <h3 class="section-title"><i class="fas fa-language" aria-hidden="true"></i> Idiomas</h3>
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
              <button class="remove-btn" @click="removeItem('languages', index)" type="button" :aria-label="'Remover idioma ' + (index + 1)">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('languages')" type="button">+ Adicionar Idioma</button>

          <!-- Referências -->
          <h3 class="section-title"><i class="fas fa-users" aria-hidden="true"></i> Referências</h3>
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
              <button class="remove-btn" @click="removeItem('references', index)" type="button" :aria-label="'Remover referência ' + (index + 1)">Remover</button>
            </div>
          </div>
          <button class="add-btn" @click="addItem('references')" type="button">+ Adicionar Referência</button>

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
                        <i class="fab fa-linkedin"></i> {{ socialNames.linkedin }}
                      </a>
                      <a v-if="form.socialLinks.facebook" :href="form.socialLinks.facebook" target="_blank" class="social-link" :aria-label="'Perfil do Facebook de ' + socialNames.facebook">
                        <i class="fab fa-facebook"></i> {{ socialNames.facebook }}
                      </a>
                      <a v-if="form.socialLinks.instagram" :href="form.socialLinks.instagram" target="_blank" class="social-link" :aria-label="'Perfil do Instagram de ' + socialNames.instagram">
                        <i class="fab fa-instagram"></i> {{ socialNames.instagram }}
                      </a>
                      <a v-if="form.socialLinks.website" :href="form.socialLinks.website" target="_blank" class="social-link" :aria-label="'Website pessoal de ' + socialNames.website">
                        <i class="fas fa-globe"></i> {{ socialNames.website }}
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
                <hr class="section-divider" v-if="form.summary && (form.experience.length || form.education.length || form.skills.length || form.languages.length || form.references.length)">

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
                <hr class="section-divider" v-if="form.experience.length && (form.education.length || form.skills.length || form.languages.length || form.references.length)">

                <!-- Formação Acadêmica -->
                <div class="cv-section" v-if="form.education.length">
                  <h3 class="section-title-cv"><i class="fas fa-graduation-cap" aria-hidden="true"></i> Formação Acadêmica</h3>
                  <div class="timeline">
                    <div v-for="(edu, i) in sortedEducation" :key="'preview-edu-' + i" class="timeline-item">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <h4 class="timeline-title">{{ edu.degree || 'Curso' }}</h4>
                        <p class="resume-text"><strong>{{ edu.institution || 'Instituição' }}</strong> - {{ edu.period || 'Período' }}</p>
                        <p class="resume-text">{{ edu.description || 'Sem descrição' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <hr class="section-divider" v-if="form.education.length && (form.skills.length || form.languages.length || form.references.length)">

                <!-- Competências -->
                <div class="cv-section" v-if="form.skills.length">
                  <h3 class="section-title-cv"><i class="fas fa-star" aria-hidden="true"></i> Competências</h3>
                  <ul class="resume-text">
                    <li v-for="(skill, i) in form.skills" :key="'preview-skill-' + i" class="skill-item">{{ skill || 'Competência' }}</li>
                  </ul>
                </div>
                <hr class="section-divider" v-if="form.skills.length && (form.languages.length || form.references.length)">

                <!-- Idiomas -->
                <div class="cv-section" v-if="form.languages.length">
                  <h3 class="section-title-cv"><i class="fas fa-language" aria-hidden="true"></i> Idiomas</h3>
                  <ul class="resume-text">
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
      form.education.push({ institution: '', degree: '', period: '', description: '' })
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
    experience: [], education: [], skills: [], languages: [], references: []
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
      skills: ['JavaScript', 'Vue.js', 'React'],
      languages: [
        { language: 'Português', level: 'Nativo' },
        { language: 'Inglês', level: 'Fluente' }
      ],
      references: [
        { name: 'Inácio Birrisau', role: 'Empreendedor' },
        { name: 'Silva Machel', role: 'Desenvolvedor'}
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
      margin: [10, 10, 10, 10], // Margens de 10mm
      filename: `${form.name.replace(/\s+/g, '_') || 'CV'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        width: 794, // Largura A4 em pixels a 96 DPI
        windowWidth: 794, // Renderização consistente
        useCORS: true // Suporta imagens externas
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        putOnlyUsedFonts: true, // Otimiza tamanho do PDF
        floatPrecision: 16 // Alta precisão no layout
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
</script>

<style scoped>
/* Importação de Fonte */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

/* Estilos Gerais */
* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
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
}

.container-fluid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 992px) {
  .container-fluid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

/* Estilos do Formulário */
.form-container {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.form-container:hover {
  transform: translateY(-2px);
}

.header-section {
  text-align: center;
  margin-bottom: 1rem;
}

.main-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.85rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.alert {
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border-radius: 0.4rem;
  font-size: 0.8rem;
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
  margin-bottom: 1rem;
}

.photo-placeholder {
  width: 80px;
  height: 80px;
  border: 2px dashed #9ca3af;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}
.photo-placeholder i {
  font-size: 18px;
  margin-bottom: 4px;
}
.photo-placeholder span {
  font-size: 10px;
  text-align: center;
  line-height: 1.2;
}

.photo-placeholder:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: scale(1.05);
}

.photo-input {
  display: none;
}

.photo-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #3b82f6;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  padding: 4px 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.remove-photo-btn:hover {
  background: rgba(185, 28, 28, 0.9);
}

.form-floating {
  position: relative;
  margin-bottom: 0.8rem;
}

.form-control-enhanced {
  width: 100%;
  padding: 0.8rem;
  border-radius: 0.4rem;
  border: 1px solid #d1d5db;
  outline: none;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.form-control-enhanced:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-floating label {
  position: absolute;
  top: 50%;
  left: 0.8rem;
  transform: translateY(-50%);
  color: #6b7280;
  transition: all 0.2s ease;
  pointer-events: none;
  font-size: 0.9rem;
}

.form-control-enhanced:focus + label,
.form-control-enhanced:not(:placeholder-shown) + label {
  top: 0.1rem;
  font-size: 0.7rem;
  color: #3b82f6;
}

textarea.form-control-enhanced {
  min-height: 80px;
  resize: vertical;
}

.borda-destacada {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.borda-destacada:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
}

.add-btn, .remove-btn, .download-btn, .reset-btn {
  border: none;
  border-radius: 0.4rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.add-btn {
  background: #16a34a;
  color: white;
  width: 100%;
}

.add-btn:hover {
  background: #15803d;
}

.remove-btn {
  background: #b91c1c;
  color: white;
  padding: 0.4rem 0.8rem;
}

.remove-btn:hover {
  background: #991b1b;
}

.download-btn {
  background: #1e40af;
  color: white;
  padding: 0.6rem 1.2rem;
}

.download-btn:hover {
  background: #1e3a8a;
}

.download-btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
}

.reset-btn {
  background: #f59e0b;
  color: white;
}

.reset-btn:hover {
  background: #d97706;
}

/* Botões de Ação (Restaurados) */
.actions-block {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: 1rem;
}

.actions-inline {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

/* Estilos da Visualização do CV */
.preview-container {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.preview-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.cv-preview {
  width: 210mm; /* Largura A4 */
  height: 297mm; /* Altura A4 */
  margin: 0 auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
  box-sizing: border-box;
}

.cv-document {
  width: 100%;
  height: 297mm; /* Altura fixa para uma página */
  display: flex;
  flex-direction: column;
  font-size: 9pt; /* Fonte compacta */
  overflow: hidden; /* Evita estouro */
}

.cv-header {
  background: #1e40af;
  color: white;
  padding: 8mm; /* Compacto */
  max-height: 40mm; /* Limita o cabeçalho */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: 5mm;
  width: 100%;
  max-width: 190mm; /* Conta margens de 10mm */
  margin: 0 auto;
}

.profile-section {
  display: flex;
  align-items: flex-start;
  gap: 3mm;
  flex: 1;
  max-height: 35mm; /* Compacto */
}

.profile-photo {
  width: 25mm;
  height: 25mm;
  border-radius: 50%;
  overflow: hidden;
  border: 1mm solid white;
  flex-shrink: 0;
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
  font-size: 14pt; /* Compacto */
  font-weight: 700;
  margin: 0;
  color: white;
  line-height: 1.1;
}

.cv-title {
  font-size: 10pt; /* Compacto */
  font-weight: 500;
  margin: 1mm 0 0;
  color: white;
  line-height: 1.1;
}

.contact-info {
  text-align: right;
  font-size: 8pt; /* Compacto */
  flex: 1;
  max-height: 35mm; /* Compacto */
}

.contact-item {
  margin: 0.5mm 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1mm;
}

.contact-item i {
  font-size: 7pt;
}

.social-links {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1mm; /* Compacto */
  margin-top: 2mm;
}

.social-link {
  color: white;
  font-size: 8pt;
  display: flex;
  align-items: center;
  gap: 1mm;
  text-decoration: none;
}

.social-link:hover {
  color: #a5b4fc;
}

.social-link i {
  font-size: 8pt;
}

.cv-body {
  padding: 8mm; /* Compacto */
  color: #1f2937;
  width: 100%;
  max-width: 190mm;
  margin: 0 auto;
  flex: 1;
  max-height: 246mm; /* Reserva espaço para o rodapé (297mm - 40mm cabeçalho - 11mm rodapé) */
}

.cv-section {
  margin-bottom: 3mm; /* Compacto, reduzido para economizar espaço */
}

.section-title-cv {
  font-size: 10pt; /* Compacto */
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 2mm;
  display: flex;
  align-items: center;
  gap: 1mm;
  text-transform: uppercase;
}

.section-title-cv i {
  font-size: 8pt;
}

.section-divider {
  border: none;
  height: 1px;
  background-color: #1e3a8a;
  margin: 4mm 0; /* Compacto */
}

.resume-text {
  font-size: 9pt; /* Compacto */
  line-height: 1.3; /* Compacto */
  color: #374151;
  max-height: 20mm; /* Limita textos longos */
  overflow: hidden;
}

.timeline {
  position: relative;
  margin-left: 8mm;
  padding-left: 8mm;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 4mm;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #1e3a8a;
}

.timeline-item {
  position: relative;
  margin-bottom: 4mm; /* Compacto */
  padding-left: 8mm;
}

.timeline-marker {
  position: absolute;
  left: -1mm;
  top: 1mm;
  width: 6mm;
  height: 6mm;
  background-color: #1e3a8a;
  border-radius: 50%;
  border: 1px solid white;
}

.timeline-content p.resume-text {
  max-height: 15mm; /* Limita descrições */
  overflow: hidden;
}

.timeline-title {
  font-size: 10pt; /* Compacto */
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1mm;
}

/* Competências e Idiomas (Layout Horizontal com Bordas Arredondadas) */
.resume-text ul {
  display: flex;
  flex-wrap: wrap;
  gap: 2mm; /* Espaçamento entre itens */
  padding: 0;
  margin: 1mm 0;
  list-style: none;
}

.skill-item, .language-item {
  border: 1px solid #1e3a8a;
  border-radius: 4mm; /* Extremidades arredondadas */
  padding: 1mm 3mm;
  font-size: 9pt;
  color: #374151;
  background: #f8fafc;
}

/* Rodapé com Logotipo */
.cv-footer {
  padding: 5mm; /* Compacto */
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-top: auto;
  min-height: 11mm; /* Garante espaço para o logotipo */
}

.footer-logo {
  width: 12mm; /* Compacto */
  height: auto;
}

/* Erros de Campo */
.field-error {
  color: #b91c1c;
  display: block;
  margin-top: 0.2rem;
  font-size: 0.8rem;
}

/* Animações */
@keyframes fadeInUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.form-container, .preview-container {
  animation: fadeInUp 0.5s ease;
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
    height: 297mm;
    margin: 0;
    padding: 0;
    border: none;
    box-shadow: none;
    overflow: hidden;
  }

  .cv-document {
    width: 100%;
    height: 297mm;
    overflow: hidden;
  }

  .cv-header {
    page-break-after: avoid;
  }

  .cv-body {
    page-break-inside: avoid;
  }

  .cv-section,
  .timeline-item {
    page-break-inside: avoid;
  }

  .cv-footer {
    page-break-before: avoid;
  }

  .preview-header {
    display: none;
  }

  .social-link {
    color: white !important;
  }

  .timeline::before,
  .timeline-marker {
    background-color: #1e3a8a !important;
  }

  .skill-item, .language-item {
    border: 1px solid #1e3a8a !important;
    background: #f8fafc !important;
  }
}
</style>