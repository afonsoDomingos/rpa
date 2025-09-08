<template>
  <div>
    <!-- Navbar fixo -->
    <div class="container-fluid position-sticky z-index-sticky top-0 px-0">
      <div class="row gx-0">
        <div class="col-12">
          <NavbarDefault :sticky="true" />
        </div>
      </div>
    </div>

 

    <!-- Conteúdo principal -->
  <div class="cv-generator">
       <br/><br/><br/>
    <div class="container-fluid">
      <!-- Formulário -->
      <div class="form-container">
        <div class="header-section">
          <h1 class="main-title">Gerador de CV</h1>
          <p class="subtitle">Preencha os dados abaixo para gerar o seu currículo</p>
           <button class="download-btn" @click="toggleExampleData">
  {{ isFilled ? 'Despreencher Exemplo' : 'Preencher com Exemplo' }}
</button>

        </div>

        <!-- Upload Foto -->
        <div class="photo-upload-container">
          <div v-if="photo" class="photo-preview">
            <img :src="photo" alt="Foto de perfil" />
            <button class="remove-photo-btn" @click="removePhoto">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <label v-else class="photo-placeholder">
            <i class="fas fa-camera"></i>
            <span>Upload Foto</span>
            <input type="file" class="photo-input" @change="onPhotoUpload" />
          </label>
        </div>

        <!-- Dados Pessoais -->
        <h3 class="section-title"><i class="fas fa-user"></i> Dados Pessoais</h3>
        <div class="borda-destacada mb-3">
          <div class="form-floating mb-3">
            <input v-model="form.name" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Nome Completo</label>
          </div>
          <div class="form-floating mb-3">
            <input v-model="form.title" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Profissão</label>
          </div>
          <div class="form-floating mb-3">
            <input v-model="form.idNumber" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Número do Bilhete de Identidade</label>
          </div>
          <div class="form-floating mb-3">
            <input v-model="form.birthDate" type="date" class="form-control-enhanced" placeholder=" " />
            <label>Data de Nascimento</label>
          </div>
          <div class="form-floating mb-3">
            <input v-model="form.email" type="email" class="form-control-enhanced" placeholder=" " />
            <label>Email</label>
          </div>
          <div class="form-floating mb-3">
            <input v-model="form.phone" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Telefone</label>
          </div>
          <div class="form-floating mb-3">
            <input v-model="form.address" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Endereço</label>
          </div>
        </div>

        <!-- Resumo -->
        <h3 class="section-title"><i class="fas fa-align-left"></i> Sobre Mim</h3>
        <div class="borda-destacada mb-3">
          <div class="form-floating">
            <textarea v-model="form.summary" class="form-control-enhanced" placeholder=" "></textarea>
            <label>Resumo Profissional</label>
          </div>
        </div>

        <!-- Experiência -->
        <h3 class="section-title"><i class="fas fa-briefcase"></i> Experiência Profissional</h3>
        <div v-for="(exp, index) in form.experience" :key="index" class="borda-destacada mb-3">
          <div class="form-floating mb-2">
            <input v-model="exp.company" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Empresa</label>
          </div>
          <div class="form-floating mb-2">
            <input v-model="exp.role" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Cargo</label>
          </div>
          <div class="form-floating mb-2">
            <input v-model="exp.period" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Período</label>
          </div>
          <div class="form-floating mb-2">
            <input v-model="exp.yearsExp" type="number" class="form-control-enhanced" placeholder=" " min="0" />
            <label>Anos de Experiência</label>
          </div>
          <div class="form-floating mb-2">
            <textarea v-model="exp.description" class="form-control-enhanced" placeholder=" "></textarea>
            <label>Descrição</label>
          </div>
          <div class="actions-inline">
            <button class="remove-btn" @click="removeExperience(index)">Remover</button>
          </div>
        </div>
        <button class="add-btn" @click="addExperience">+ Adicionar Experiência</button>

        <!-- Formação -->
        <h3 class="section-title"><i class="fas fa-graduation-cap"></i> Formação Académica</h3>
        <div v-for="(edu, index) in form.education" :key="index" class="borda-destacada mb-3">
          <div class="form-floating mb-2">
            <input v-model="edu.institution" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Instituição</label>
          </div>
          <div class="form-floating mb-2">
            <input v-model="edu.degree" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Curso</label>
          </div>
          <div class="form-floating mb-2">
            <input v-model="edu.period" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Ano de Conclusão</label>
          </div>
          <div class="form-floating mb-2">
            <textarea v-model="edu.description" class="form-control-enhanced" placeholder=" "></textarea>
            <label>Descrição</label>
          </div>
          <div class="actions-inline">
            <button class="remove-btn" @click="removeEducation(index)">Remover</button>
          </div>
        </div>
        <button class="add-btn" @click="addEducation">+ Adicionar Formação</button>

        <!-- Competências -->
        <h3 class="section-title"><i class="fas fa-star"></i> Competências</h3>
        <div v-for="(skill, index) in form.skills" :key="index" class="borda-destacada mb-3">
          <div class="form-floating mb-2">
            <input v-model="form.skills[index]" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Competência</label>
          </div>
          <div class="actions-inline">
            <button class="remove-btn" @click="removeSkill(index)">Remover</button>
          </div>
        </div>
        <button class="add-btn" @click="addSkill">+ Adicionar Competência</button>

        <!-- Idiomas -->
        <h3 class="section-title"><i class="fas fa-language"></i> Idiomas</h3>
        <div v-for="(lang, index) in form.languages" :key="index" class="borda-destacada mb-3">
          <div class="form-floating mb-2">
            <input list="languages" v-model="form.languages[index].language" class="form-control-enhanced" placeholder=" " />
            <datalist id="languages">
              <option v-for="l in languageOptions" :key="l" :value="l">{{ l }}</option>
            </datalist>
            <label>Idioma</label>
          </div>
          <div class="form-floating mb-2">
            <input list="levels" v-model="form.languages[index].level" class="form-control-enhanced" placeholder=" " />
            <datalist id="levels">
              <option v-for="lvl in levelOptions" :key="lvl" :value="lvl">{{ lvl }}</option>
            </datalist>
            <label>Nível</label>
          </div>
          <div class="actions-inline">
            <button class="remove-btn" @click="removeLanguage(index)">Remover</button>
          </div>
        </div>
        <button class="add-btn" @click="addLanguage">+ Adicionar Idioma</button>

        <!-- Referências -->
        <h3 class="section-title"><i class="fas fa-users"></i> Referências</h3>
        <div v-for="(refItem, index) in form.references" :key="index" class="borda-destacada mb-3">
          <div class="form-floating mb-2">
            <input v-model="refItem.name" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Nome</label>
          </div>
          <div class="form-floating mb-2">
            <input v-model="refItem.role" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Cargo</label>
          </div>
          <div class="form-floating mb-2">
            <input v-model="refItem.contact" type="text" class="form-control-enhanced" placeholder=" " />
            <label>Contato</label>
          </div>
          <div class="actions-inline">
            <button class="remove-btn" @click="removeReference(index)">Remover</button>
          </div>
        </div>
        <button class="add-btn" @click="addReference">+ Adicionar Referência</button>

        <!-- Botões de ação -->
       
        <button class="reset-btn" @click="resetForm">Resetar Formulário</button>
        <button class="download-btn" @click="generateCV">
          <i class="fas fa-file-download"></i> Gerar CV
        </button>
      </div>

      <!-- Preview -->
      <div class="preview-container" id="cv-preview">
        <!-- Adicione v-show para controlar a exibição -->
<div class="preview-header" v-show="showPreviewHeader">
  <h2 class="preview-title"><i class="fas fa-eye"></i> Pré-visualização</h2>
</div>

        <div class="cv-preview">
          <div class="cv-document">
            <div class="cv-header">
              <div class="header-content">
                <div class="profile-section">
                  <div v-if="photo" class="profile-photo">
                    <img :src="photo" alt="Foto" />
                  </div>
                  <div class="profile-info">
                    <h1 class="cv-name">{{ form.name || "Seu Nome" }}</h1>
                    <h2 class="cv-title">{{ form.title || "Profissão" }}</h2>
                  </div>
                </div>
                <div class="contact-info">
                  <div class="contact-item"><i class="fas fa-id-card"></i> {{ form.idNumber }}</div>
                  <div class="contact-item"><i class="fas fa-birthday-cake"></i> {{ form.birthDate }}</div>
                  <div class="contact-item"><i class="fas fa-envelope"></i> {{ form.email }}</div>
                  <div class="contact-item"><i class="fas fa-phone"></i> {{ form.phone }}</div>
                  <div class="contact-item"><i class="fas fa-map-marker-alt"></i> {{ form.address }}</div>
                </div>
              </div>
            </div>
            <div class="cv-body">
              <!-- Resumo -->
              <div class="cv-section" v-if="form.summary">
                <h3 class="section-title-cv"><i class="fas fa-align-left"></i> Sobre Mim</h3>
                <p class="resume-text">{{ form.summary }}</p>
              </div>
              <!-- Experiência -->
              <div class="cv-section" v-for="(exp, i) in form.experience" :key="i">
                <h3 class="section-title-cv"><i class="fas fa-briefcase"></i> {{ exp.role }}</h3>
                <p class="resume-text"><strong>{{ exp.company }}</strong> - {{ exp.period }} ({{ exp.yearsExp }} anos)</p>
                <p class="resume-text">{{ exp.description }}</p>
              </div>
              <!-- Formação -->
              <div class="cv-section" v-for="(edu, i) in form.education" :key="i">
                <h3 class="section-title-cv"><i class="fas fa-graduation-cap"></i> {{ edu.degree }}</h3>
                <p class="resume-text"><strong>{{ edu.institution }}</strong> - {{ edu.period }}</p>
                <p class="resume-text">{{ edu.description }}</p>
              </div>
              <!-- Competências -->
              <div class="cv-section" v-if="form.skills.length">
                <h3 class="section-title-cv"><i class="fas fa-star"></i> Competências</h3>
                <ul class="resume-text">
                  <li v-for="(skill, i) in form.skills" :key="i">{{ skill }}</li>
                </ul>
              </div>
              <!-- Idiomas -->
              <div class="cv-section" v-if="form.languages.length">
                <h3 class="section-title-cv"><i class="fas fa-language"></i> Idiomas</h3>
                <ul class="resume-text">
                  <li v-for="(lang, i) in form.languages" :key="i">{{ lang.language }} - {{ lang.level }}</li>
                </ul>
              </div>
              <!-- Referências -->
              <div class="cv-section" v-if="form.references.length">
                <h3 class="section-title-cv"><i class="fas fa-users"></i> Referências</h3>
                <ul class="resume-text">
                  <li v-for="(ref, i) in form.references" :key="i">{{ ref.name }} - {{ ref.role }} - {{ ref.contact }}</li>
                </ul>
              </div>
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
import { ref, nextTick } from 'vue'
import html2pdf from 'html2pdf.js'
import NavbarDefault from "../examples/navbars/NavbarDefault.vue"
import FooterDefault from "../examples/footers/FooterDefault.vue"
import exemploPhoto from '@/assets/img/afonsodomingos.jpg'

// Estado do formulário
const form = ref({
  name: "",
  title: "",
  idNumber: "",
  birthDate: "",
  email: "",
  phone: "",
  address: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  references: []
})

const photo = ref(null)
const isFilled = ref(false)
const languageOptions = ["Português", "Inglês", "Francês", "Espanhol", "Chinês", "Alemão"]
const levelOptions = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"]

const onPhotoUpload = (e) => {
  const file = e.target.files[0]
  if (file) photo.value = URL.createObjectURL(file)
}
const removePhoto = () => { photo.value = null }

const addExperience = () => form.value.experience.push({ company: "", role: "", period: "", yearsExp: 0, description: "" })
const removeExperience = (i) => form.value.experience.splice(i, 1)

const addEducation = () => form.value.education.push({ institution: "", degree: "", period: "", yearsExp: 0, description: "" })
const removeEducation = (i) => form.value.education.splice(i, 1)

const addSkill = () => form.value.skills.push("")
const removeSkill = (i) => form.value.skills.splice(i, 1)

const addLanguage = () => form.value.languages.push({ language: "", level: "" })
const removeLanguage = (i) => form.value.languages.splice(i, 1)

const addProject = () => form.value.projects.push({ name: "", description: "", link: "" })
const removeProject = (i) => form.value.projects.splice(i, 1)

const addReference = () => form.value.references.push({ name: "", role: "", contact: "" })
const removeReference = (i) => form.value.references.splice(i, 1)

const resetForm = () => {
  form.value = {
    name: "",
    title: "",
    idNumber: "",
    birthDate: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    references: []
  }
  photo.value = null
  isFilled.value = false
}

const toggleExampleData = () => {
  if (!isFilled.value) {
    photo.value = exemploPhoto
    form.value.name = "Afonso Domingos"
    form.value.title = "Profissional de Tecnologia / Front-End"
    form.value.idNumber = "110301744616C"
    form.value.birthDate = "1998-01-01"
    form.value.email = "karinganastudio23@gmail.com"
    form.value.phone = "847 877 405"
    form.value.address = "Maputo, Moçambique"
    form.value.summary = "Profissional apaixonado por tecnologia, com experiência em front-end, IA, gestão de redes sociais e branding, usando ferramentas da Meta e Adobe."
    form.value.experience = [
      { company: "Front‑End DpWorks", role: "Desenvolvimento de Ecommerce e TI", period: "2018–2020", yearsExp: 2, description: "" },
      { company: "Fullstack Quinatec Lda", role: "Desenvolvimento, IT Specialist – Brand Manager OmniTrack Quality", period: "2024", yearsExp: 1, description: "" }
    ]
    form.value.education = [
      { institution: "Maxaquene B", degree: "7ª Classe", period: "2010", yearsExp: 1, description: "" },
      { institution: "Noroeste 1", degree: "12ª Classe", period: "2018", yearsExp: 1, description: "" }
    ]
    form.value.skills = ["HTML", "CSS", "JavaScript", "Vue.js", "React"]
    form.value.languages = [
      { language: "Português", level: "Nativo" },
      { language: "Inglês", level: "Fluente" }
    ]
    form.value.references = [
      { name: "Inácio Birrisau", role: "Empreendedor", contact: "84*******" },
      { name: "Silva Machel", role: "Desenvolvedor de Negócios", contact: "84*******" },
      { name: "Pedro Muiambo", role: "Eng. Informático", contact: "84*******" },
      { name: "Jorge Quinarivo", role: "Eng. Informático", contact: "84*******" },
      { name: "Douglas Pendula", role: "Eng. Informático", contact: "84*******" }
    ]
    isFilled.value = true
  } else {
    resetForm()
  }
}

const showPreviewHeader = ref(true)

const generateCV = async () => {
  showPreviewHeader.value = false
  await nextTick()
  const element = document.getElementById("cv-preview")
  html2pdf().from(element).save(`${form.value.name || "CV"}.pdf`).then(() => {
    showPreviewHeader.value = true
  })
}
</script>






<style scoped>
/* Fonte Poppins */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.section-title i {
  margin-right: 0.5rem; /* Espaço entre ícone e texto */
  color: #3f51b5;       /* Cor do ícone */
}

.remove-photo-btn i {
  font-size: 0.8rem;
}


* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
}

/* Container geral */
.cv-generator {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 2rem;
}

.container-fluid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

@media (max-width: 992px) {
  .container-fluid {
    grid-template-columns: 1fr;
  }
}

/* Formulário */
.form-container {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  color: #555;
}

/* Upload de foto */
.photo-upload-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.photo-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #9e9e9e;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9e9e9e;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.photo-placeholder:hover {
  border-color: #3f51b5;
  color: #3f51b5;
  transform: scale(1.05);
}

.photo-input {
  display: none;
}

.photo-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #3f51b5;
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
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  padding: 4px 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.remove-photo-btn:hover {
  background: red;
}

/* Inputs */
.form-floating {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-control-enhanced {
  width: 100%;
  padding: 1rem;
  border-radius: 0.8rem;
  border: 1px solid #ccc;
  outline: none;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.form-control-enhanced:focus {
  border-color: #3f51b5;
  box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.2);
}

.form-floating label {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #999;
  transition: all 0.3s ease;
  pointer-events: none;
}

.form-control-enhanced:focus + label,
.form-control-enhanced:not(:placeholder-shown) + label {
  top: 0.4rem;
  font-size: 0.8rem;
  color: #3f51b5;
}

/* Destaque de blocos */
.borda-destacada {
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 20px;
  background-color: #fff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.borda-destacada:hover {
  border-color: #800080;
  box-shadow: 0 8px 20px rgba(128, 0, 128, 0.25);
  transform: scale(1.02);
}

/* Botões */
.add-btn, .remove-btn, .download-btn, .reset-btn, .example-btn {
  border: none;
  border-radius: 0.8rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
}

.add-btn {
  background: #66bb6a;
  color: #fff;
}

.add-btn:hover { background: #388e3c; }

.remove-btn {
  background: #e53935;
  color: #fff;
  width: auto;
  padding: 0.4rem 0.8rem;
}

.remove-btn:hover { background: #c62828; }

.download-btn {
  background: #3f51b5;
  color: white;
}

.download-btn:hover { background: #303f9f; transform: translateY(-2px); }

.reset-btn {
  background: #f57c00;
  color: white;
}

.reset-btn:hover { background: #e65100; transform: translateY(-1px); }

.example-btn {
  background: #00acc1;
  color: white;
}

.example-btn:hover { background: #00838f; transform: translateY(-1px); }

/* Preview */
.preview-container {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.preview-header {
  margin-bottom: 1rem;
}

.preview-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a237e;
}

.cv-preview {
  border: 1px solid #ddd;
  border-radius: 1rem;
  overflow: hidden;
}

.cv-document {
  font-family: 'Poppins', sans-serif;
}

.cv-header {
  background: #3f51b5;
  color: white;
  padding: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.profile-section {
  display: flex;
  align-items: center;
}

.profile-photo {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  border: 2px solid white;
}

.profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info .cv-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #fff;
}

.profile-info .cv-title {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  color: #fff;
}

.contact-info {
  text-align: right;
}

.contact-item {
  font-size: 0.9rem;
}

.cv-body {
  padding: 1.5rem;
}

.cv-section {
  margin-bottom: 1.5rem;
}

.section-title-cv {
  font-size: 1.2rem;
  font-weight: 600;
  color: #3f51b5;
  margin-bottom: 0.5rem;
}

.resume-text {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.6;
}

/* Animações */
@keyframes fadeInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.section-title,
.section-title-cv,
.main-title {
  text-transform: uppercase;
}



</style>




