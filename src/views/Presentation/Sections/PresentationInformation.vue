<script setup>
import RotatingCard from "../../../examples/cards/rotatingCards/RotatingCard.vue";
import RotatingCardFront from "../../../examples/cards/rotatingCards/RotatingCardFront.vue";
import RotatingCardBack from "../../../examples/cards/rotatingCards/RotatingCardBack.vue";
import DefaultInfoCard from "../../../examples/cards/infoCards/DefaultInfoCard.vue";
</script>
<template>
  <section class="my-5 py-5">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-4 ms-auto me-auto p-lg-4 mt-lg-0 mt-4">
          <RotatingCard>
            <RotatingCardFront
              image=""
              icon="touch_app"
              title="Recupera <br /> Aqui"
              description="Perdeu um documento? Registre a perda, deixe nossa equipe analisar, busque nos órgãos competentes e receba seu documento recuperado diretamente. Simples e eficiente."
            />

            <RotatingCardBack
              image=""
              title="Recupera Aqui"
              description="Nossa plataforma cuida de tudo: basta registrar a perda, e nossa equipe encontra e entrega seu documento de volta, de maneira rápida e sem complicação."
              :action="[
                {
                  route:
                    'https://docs.google.com/forms/d/e/1FAIpQLSdLO0mga6ygr6oVlCHQ6Hgt48baiZuQlXTzPRYynhXv0etD3g/viewform',
                  label: 'Reportar',
                },
              ]"
            />
          </RotatingCard>
        </div>
        <div class="col-lg-6 ms-auto">
          <div class="row justify-content-start">
            <DefaultInfoCard
              icon="content_copy"
              title="Cadastro de Documento"
              description="Registre o documento perdido e forneça os detalhes necessários para iniciar a busca."
            />
            <DefaultInfoCard
              icon="flip_to_front"
              title="Análise do Caso"
              description="Nossa equipe avalia sua solicitação para determinar o melhor caminho de recuperação."
            />
          </div>
          <div class="row justify-content-start mt-5">
            <DefaultInfoCard
              class="mt-3"
              icon="content_copy"
              title="Busca e Verificação"
              description="Iniciamos a pesquisa para localizar seu documento."
            />
            <DefaultInfoCard
              class="mt-3"
              icon="devices"
              title="Recuperação e Entrega"
              description="Assim que o documento for encontrado, nós o entregamos diretamente a você."
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
