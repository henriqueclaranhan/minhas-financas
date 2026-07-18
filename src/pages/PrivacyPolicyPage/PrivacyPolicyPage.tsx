import { Shield } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { useAuth } from '../../store/AuthContext';
import './PrivacyPolicyPage.css';

export function PrivacyPolicyPage() {
  const { user } = useAuth();

  return (
    <div className={`privacy-page ${!user ? 'unauth-padding' : ''}`}>
      <PageHeader 
        title="Política de Privacidade" 
        showBackButton={true}
        forceShowBackButtonOnDesktop={true}
      />

      <div className="privacy-content glass-panel">
        <div className="privacy-icon-wrapper">
          <Shield size={48} color="var(--clr-primary)" />
        </div>
        
        <p className="privacy-last-updated">Última atualização: 18 de Julho de 2026</p>

        <section>
          <h2>1. Introdução</h2>
          <p>
            Bem-vindo ao <strong>Minhas Finanças</strong>. Esta Política de Privacidade explica como coletamos, usamos, 
            compartilhamos e protegemos suas informações pessoais quando você utiliza nosso aplicativo.
            A sua privacidade é uma prioridade para nós, e estamos comprometidos em proteger os seus dados 
            em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </p>
        </section>

        <section>
          <h2>2. Dados que Coletamos</h2>
          <p>Coletamos os seguintes tipos de informações:</p>
          <ul>
            <li><strong>Dados de Conta:</strong> Nome, endereço de e-mail e informações de autenticação quando você cria uma conta (via provedor como Google ou e-mail/senha).</li>
            <li><strong>Dados Financeiros:</strong> Informações sobre transações, receitas, despesas, cartões de crédito e planejamento financeiro que você insere no aplicativo.</li>
            <li><strong>Dados de Uso:</strong> Informações sobre como você interage com o aplicativo, idioma preferido e tema (claro/escuro).</li>
          </ul>
        </section>

        <section>
          <h2>3. Como Usamos Seus Dados</h2>
          <p>Utilizamos suas informações exclusivamente para:</p>
          <ul>
            <li>Fornecer, operar e manter os serviços do aplicativo.</li>
            <li>Gerar relatórios, gráficos e previsões financeiras personalizadas.</li>
            <li>Melhorar, personalizar e expandir nossos serviços.</li>
            <li>Entrar em contato com você para atualizações importantes de segurança ou conta.</li>
          </ul>
          <p><strong>Importante:</strong> Nós não vendemos, alugamos ou compartilhamos seus dados financeiros pessoais com terceiros para fins de marketing ou publicidade.</p>
        </section>

        <section>
          <h2>4. Armazenamento e Segurança</h2>
          <p>
            Seus dados são armazenados de forma segura utilizando serviços em nuvem confiáveis (como Google Firebase). 
            Empregamos medidas de segurança rígidas e criptografia de ponta a ponta durante a transmissão de dados 
            para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </section>

        <section>
          <h2>5. Seus Direitos (LGPD)</h2>
          <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:</p>
          <ul>
            <li>Solicitar acesso aos seus dados pessoais armazenados.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
            <li>Revogar o consentimento a qualquer momento e excluir sua conta e todos os dados associados.</li>
          </ul>
        </section>

        <section>
          <h2>6. Exclusão de Conta</h2>
          <p>
            Você pode solicitar a exclusão permanente de sua conta e de todos os dados financeiros vinculados a ela 
            diretamente pelas configurações do aplicativo ou entrando em contato conosco. 
            Uma vez excluídos, os dados não poderão ser recuperados.
          </p>
        </section>

        <section>
          <h2>7. Alterações nesta Política</h2>
          <p>
            Podemos atualizar nossa Política de Privacidade periodicamente. 
            Recomendamos que você revise esta página regularmente para quaisquer alterações. 
            Notificaremos sobre mudanças significativas através do próprio aplicativo.
          </p>
        </section>

        <section>
          <h2>8. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados, 
            entre em contato conosco através dos canais de suporte no aplicativo.
          </p>
        </section>
      </div>
    </div>
  );
}
