export default class PatientProfile {
  constructor(dataInput) {
    const raw = dataInput || {};
    this.metadata_configuracion_ui = raw.metadata_configuracion_ui || {};

    // A. Identificación (Sistema + Legal)
    this.identificacion = {
      uuid: raw.identificacion?.uuid || crypto.randomUUID(), // Genera ID único para D1
      codigo_interno_cima: raw.identificacion?.codigo_interno_cima || "", // "HC-001"
      estado_paciente: raw.identificacion?.estado_paciente || "Activo",
      documento_tipo: raw.identificacion?.documento_tipo || "",
      documento_numero: raw.identificacion?.documento_numero || ""
    };

    // B. Nombres (Separados)
    this.nombres = {
      primer_nombre: raw.nombres?.primer_nombre || "",
      segundo_nombre: raw.nombres?.segundo_nombre || "",
      primer_apellido: raw.nombres?.primer_apellido || "",
      segundo_apellido: raw.nombres?.segundo_apellido || ""
    };

    // C. Demografía
    this.demografia = {
      fecha_nacimiento: raw.demografia?.fecha_nacimiento || null,
      edad_auto: 0, 
      genero: raw.demografia?.genero || "Desconocido",
      identidad_genero: raw.demografia?.identidad_genero || "", 
      estado_civil: raw.demografia?.estado_civil || ""
    };

    // D. Biológicos
    this.datos_biologicos = {
      grupo_sanguineo: raw.datos_biologicos?.grupo_sanguineo || "",
      factor_rh: raw.datos_biologicos?.factor_rh || "",
      peso_kg: raw.datos_biologicos?.peso_kg || 0,
      talla_cm: raw.datos_biologicos?.talla_cm || 0,
      imc_auto: 0,
      lateralidad: raw.datos_biologicos?.lateralidad || ""
    };

    // E. Contacto
    this.contacto = {
      tel_principal: raw.contacto?.tel_principal || "",
      tel_secundario: raw.contacto?.tel_secundario || "",
      email_principal: raw.contacto?.email_principal || "",
      email_secundario: raw.contacto?.email_secundario || "",
      dir_calle_num: raw.contacto?.dir_calle_num || "",
      dir_ciudad: raw.contacto?.dir_ciudad || "",
      dir_estado: raw.contacto?.dir_estado || "",
      dir_pais: raw.contacto?.dir_pais || "",
      dir_postal: raw.contacto?.dir_postal || ""
    };

    // F. Redes Sociales (Huella Digital)
    this.redes_sociales = {
      instagram: raw.redes_sociales?.instagram || "",
      x_twitter: raw.redes_sociales?.x_twitter || "",
      linkedin: raw.redes_sociales?.linkedin || "",
      facebook: raw.redes_sociales?.facebook || ""
    };

    // G. Emergencia
    this.contacto_emergencia = {
      nombre: raw.contacto_emergencia?.nombre || "",
      parentesco: raw.contacto_emergencia?.parentesco || "",
      telefono: raw.contacto_emergencia?.telefono || "",
      email: raw.contacto_emergencia?.email || ""
    };

    // H. Alertas Clínicas
    this.alertas_clinicas = {
      alergias_check: !!raw.alertas_clinicas?.alergias_check,
      alergias_detalle: raw.alertas_clinicas?.alergias_detalle || "",
      cronicas_check: !!raw.alertas_clinicas?.cronicas_check,
      cronicas_detalle: raw.alertas_clinicas?.cronicas_detalle || "",
      medicamentos_check: !!raw.alertas_clinicas?.medicamentos_check,
      medicamentos_detalle: raw.alertas_clinicas?.medicamentos_detalle || ""
    };

    // I. Seguridad Prioritaria
    this.seguridad_prioritaria = {
      riesgo_caidas: raw.seguridad_prioritaria?.riesgo_caidas || "Bajo",
      voluntad_anticipada: raw.seguridad_prioritaria?.voluntad_anticipada || "No registrada"
    };

    // J. Administrativos
    this.datos_administrativos = {
      aseguradora: raw.datos_administrativos?.aseguradora || "",
      numero_poliza: raw.datos_administrativos?.numero_poliza || "",
      referido_por: raw.datos_administrativos?.referido_por || "",
      fecha_admision: raw.datos_administrativos?.fecha_admision || null,
      fecha_alta: raw.datos_administrativos?.fecha_alta || null
    };

    // K. Antecedentes Personales (Checklist)
    this.antecedentes_personales = {
      hipertension: !!raw.antecedentes_personales?.hipertension,
      diabetes: !!raw.antecedentes_personales?.diabetes,
      asma: !!raw.antecedentes_personales?.asma,
      cardiopatias: !!raw.antecedentes_personales?.cardiopatias,
      epilepsia: !!raw.antecedentes_personales?.epilepsia,
      tiroideos: !!raw.antecedentes_personales?.tiroideos,
      otros: raw.antecedentes_personales?.otros || "Ninguno"
    };

    // L. Historial Quirúrgico
    this.historial_quirurgico = {
      tiene_cirugias: !!raw.historial_quirurgico?.tiene_cirugias,
      descripcion: raw.historial_quirurgico?.descripcion || "",
      anio: raw.historial_quirurgico?.anio || null,
      complicaciones: raw.historial_quirurgico?.complicaciones || ""
    };

    // M. Hospitalizaciones
    this.hospitalizaciones = {
      ha_sido_hospitalizado: !!raw.hospitalizaciones?.ha_sido_hospitalizado,
      motivo: raw.hospitalizaciones?.motivo || "",
      anio: raw.hospitalizaciones?.anio || null,
      transfusiones: !!raw.hospitalizaciones?.transfusiones
    };

    // N. Lesiones y Fracturas
    this.lesiones_y_fracturas = {
      lesion_desc: raw.lesiones_y_fracturas?.lesion_desc || "",
      lesion_tipo: raw.lesiones_y_fracturas?.lesion_tipo || "",
      fractura_bool: !!raw.lesiones_y_fracturas?.fractura_bool,
      hueso: raw.lesiones_y_fracturas?.hueso || ""
    };

    // O. Antecedentes Familiares
    this.antecedentes_familiares = {
      hipertension: !!raw.antecedentes_familiares?.hipertension,
      diabetes: !!raw.antecedentes_familiares?.diabetes,
      cancer: !!raw.antecedentes_familiares?.cancer,
      cardiopatias: !!raw.antecedentes_familiares?.cardiopatias,
      geneticas: raw.antecedentes_familiares?.geneticas || "Ninguna"
    };

    // P. Hábitos
    this.habitos = {
      tabaquismo: raw.habitos?.tabaquismo || "Niega",
      alcohol: raw.habitos?.alcohol || "Niega",
      sustancias: raw.habitos?.sustancias || "Niega",
      actividad_fisica: raw.habitos?.actividad_fisica || "Sedentario",
      alimentacion: raw.habitos?.alimentacion || "Regular"
    };

    // Q. Contexto Social
    this.contexto_social = {
      ocupacion: raw.contexto_social?.ocupacion || "",
      educacion: raw.contexto_social?.educacion || "",
      vivienda: raw.contexto_social?.vivienda || "",
      cuidador: !!raw.contexto_social?.cuidador,
      barreras_comunicacion: raw.contexto_social?.barreras_comunicacion || "",
      contacto_digital: raw.contexto_social?.contacto_digital || "Telefono"
    };

    // R. Consentimientos
    this.consentimientos = {
       tratamiento_datos: !!raw.consentimientos?.tratamiento_datos,
       fecha_firma: raw.consentimientos?.fecha_firma || new Date().toISOString()
    };

    // Lógica Automática
    this._calcularCampos();
  }

  _calcularCampos() {
    // Edad
    if (this.demografia.fecha_nacimiento) {
      const hoy = new Date();
      const cumple = new Date(this.demografia.fecha_nacimiento);
      if (!isNaN(cumple.getTime())) {
        let edad = hoy.getFullYear() - cumple.getFullYear();
        if (hoy.getMonth() < cumple.getMonth() || (hoy.getMonth() === cumple.getMonth() && hoy.getDate() < cumple.getDate())) {
          edad--;
        }
        this.demografia.edad_auto = edad >= 0 ? edad : 0;
      }
    }
    // IMC
    const p = parseFloat(this.datos_biologicos.peso_kg);
    const t = parseFloat(this.datos_biologicos.talla_cm);
    if (p > 0 && t > 0) {
      const tm = t / 100;
      this.datos_biologicos.imc_auto = parseFloat((p / (tm * tm)).toFixed(2));
    }
  }
}