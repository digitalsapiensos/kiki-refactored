/**
 * Configuración de modelos LLM - Panel administrativo
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/admin/llm-config/page.tsx
 */

// TODO: Importar componentes de formulario
// TODO: Importar hooks para configuración

export default function AdminLLMConfigPage() {
  // TODO: Cargar configuración actual de LLMs
  // TODO: Gestionar API keys y límites

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Configuración de Modelos LLM</h1>

      {/* Lista de proveedores */}
      <div className="space-y-6">
        {/* Claude */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Anthropic Claude</h2>
          {/* TODO: Formulario de configuración Claude */}
          <div className="space-y-4">
            {/* API Key */}
            {/* Modelos disponibles */}
            {/* Límites de uso */}
          </div>
        </div>

        {/* OpenAI */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">OpenAI</h2>
          {/* TODO: Formulario de configuración OpenAI */}
        </div>

        {/* Google Gemini */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Google Gemini</h2>
          {/* TODO: Formulario de configuración Gemini */}
        </div>

        {/* DeepSeek */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">DeepSeek</h2>
          {/* TODO: Formulario de configuración DeepSeek */}
        </div>

        {/* Qwen */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Qwen</h2>
          {/* TODO: Formulario de configuración Qwen */}
        </div>
      </div>

      {/* Configuración por defecto */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Configuración por Defecto</h2>
        {/* TODO: Selector de modelo por defecto por fase */}
      </div>
    </div>
  )
}