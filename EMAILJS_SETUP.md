# Configuración de EmailJS para el Formulario de Contacto

El formulario de contacto está configurado para enviar correos a **mailto:tu@email.com** usando EmailJS.

## Pasos para configurar EmailJS:

### 1. Crear una cuenta en EmailJS
- Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
- Regístrate gratis (permite hasta 200 correos/mes)

### 2. Configurar el Servicio de Email
1. En el dashboard, ve a **Email Services**
2. Haz clic en **Add New Service**
3. Selecciona **Gmail** (o tu proveedor preferido)
4. Conecta tu cuenta de Gmail (mailto:tu@email.com)
5. Copia el **Service ID** que se genera

### 3. Crear una Plantilla de Email
1. Ve a **Email Templates**
2. Haz clic en **Create New Template**
3. Usa esta configuración:

**Subject:**
```
Nuevo mensaje de contacto: {{subject}}
```

**Content:**
```
Has recibido un nuevo mensaje de contacto desde tu portfolio:

Nombre: {{from_name}}
Email: {{from_email}}
Asunto: {{subject}}

Mensaje:
{{message}}

---
Este correo fue enviado automáticamente desde tu portfolio.
```

**To Email:**
```
{{to_email}}
```

4. Guarda y copia el **Template ID**

### 4. Obtener tu Public Key
1. Ve a **Account** → **General**
2. Copia tu **Public Key**

### 5. Actualizar el código
Abre el archivo `src/components/sections/Contact.tsx` y reemplaza estos valores en la línea ~26:

```typescript
const serviceId = 'YOUR_SERVICE_ID'; // Reemplaza con tu Service ID
const templateId = 'YOUR_TEMPLATE_ID'; // Reemplaza con tu Template ID
const publicKey = 'YOUR_PUBLIC_KEY'; // Reemplaza con tu Public Key
```

### 6. Probar el formulario
1. Inicia tu aplicación
2. Ve a la sección de Contacto
3. Completa y envía el formulario
4. Deberías recibir el correo en mailto:tu@email.com

## Estructura de variables del formulario

El formulario envía estos campos a EmailJS:
- `to_email`: mailto:tu@email.com (hardcoded)
- `from_name`: Nombre del usuario
- `from_email`: Email del usuario
- `subject`: Asunto del mensaje
- `message`: Contenido del mensaje

## Límites del plan gratuito
- 200 correos/mes
- 2 plantillas de email
- 1 servicio de email

Si necesitas más, puedes actualizar al plan de pago.

## Seguridad
- EmailJS expone tu Public Key en el frontend (es normal y seguro)
- No expongas tu Private Key
- Puedes configurar restricciones de dominio en EmailJS para evitar spam
