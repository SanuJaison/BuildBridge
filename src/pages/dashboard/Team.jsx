import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Building2, Check, Mail, Plus, ShieldCheck, Trash2, Users, X } from "lucide-react";
import api, { getApiMessage, getFieldErrors } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { Field, FormError, Input, Select, TextArea } from "../../components/ui/Form";
import { ConfirmModal } from "../../components/ui/Modal";
import { ImageUploader } from "../../components/ui/Uploader";
import { PageHeader, Panel } from "../../components/dashboard/DashboardUI";
import { formatDate, PROVIDER_TYPE_LABELS, timeAgo } from "../../lib/format";

const ROLE_TONES = { owner: "violet", admin: "blue", member: "slate" };
const MEMBER_STATUS = {
  active: { label: "Active", tone: "mint" },
  invited: { label: "Invitation pending", tone: "amber" },
  removed: { label: "Removed", tone: "red" },
};

function organizationForm(organization) {
  return {
    name: organization?.name || "",
    description: organization?.description || "",
    industry: organization?.industry || "",
    website: organization?.website || "",
    location: organization?.location || "",
    companySize: organization?.companySize || "",
    yearEstablished: organization?.yearEstablished ?? "",
    logo: organization?.logo || "",
  };
}

export default function Team() {
  const { user, providerProfile, refresh } = useAuth();
  const toast = useToast();
  const [orgState, setOrgState] = useState({
    loading: true,
    error: "",
    organization: null,
    members: [],
    myRole: null,
  });
  const [invitations, setInvitations] = useState([]);
  const [form, setForm] = useState(organizationForm(null));
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviting, setInviting] = useState(false);
  const [roleBusyId, setRoleBusyId] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [respondingId, setRespondingId] = useState("");

  const hasOrganization = Boolean(providerProfile?.organization);

  const loadInvitations = useCallback(async () => {
    try {
      const { data } = await api.get("/team/invitations");
      setInvitations(data.items || []);
    } catch {
      setInvitations([]);
    }
  }, []);

  const loadOrganization = useCallback(async () => {
    setOrgState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/provider/organization");
      setOrgState({
        loading: false,
        error: "",
        organization: data.organization,
        members: data.members || [],
        myRole: data.myRole,
      });
      setForm(organizationForm(data.organization));
    } catch (error) {
      if (error?.response?.status === 404) {
        setOrgState({ loading: false, error: "", organization: null, members: [], myRole: null });
      } else {
        setOrgState((current) => ({
          ...current,
          loading: false,
          error: getApiMessage(error, "Your team workspace could not be loaded."),
        }));
      }
    }
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  useEffect(() => {
    if (hasOrganization) loadOrganization();
    else setOrgState({ loading: false, error: "", organization: null, members: [], myRole: null });
  }, [hasOrganization, loadOrganization]);

  usePageTitle("Team");

  const organization = orgState.organization;
  const canManage = ["owner", "admin"].includes(orgState.myRole);

  const saveOrganization = async (event) => {
    event.preventDefault();
    if (!canManage || saving) return;
    setSaving(true);
    setFormError("");
    setFieldErrors({});
    setSaved("");
    try {
      const { data } = await api.put("/provider/organization", {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        industry: form.industry.trim(),
        website: form.website.trim(),
        location: form.location.trim(),
        companySize: form.companySize.trim(),
        yearEstablished: form.yearEstablished === "" ? null : Number(form.yearEstablished),
      });
      setOrgState((current) => ({ ...current, organization: data.organization }));
      setForm(organizationForm(data.organization));
      setSaved("Organization details saved.");
      toast.success("Team workspace saved", "Your organization details have been updated.");
      await refresh();
    } catch (error) {
      setFormError(getApiMessage(error, "The organization details could not be saved."));
      setFieldErrors(getFieldErrors(error));
    } finally {
      setSaving(false);
    }
  };

  const invite = async (event) => {
    event.preventDefault();
    if (inviting) return;
    setInviteError("");
    setInviting(true);
    try {
      await api.post("/provider/members", { email: inviteEmail.trim() });
      toast.success("Invitation sent", "Your teammate will see it in their notifications and team page.");
      setInviteEmail("");
      await loadOrganization();
    } catch (error) {
      setInviteError(getApiMessage(error, "The invitation could not be sent."));
    } finally {
      setInviting(false);
    }
  };

  const changeRole = async (member, role) => {
    if (role === member.role) return;
    setRoleBusyId(member._id);
    try {
      await api.patch(`/provider/members/${member._id}`, { role });
      toast.success("Role updated", `${member.user?.name || "The teammate"} is now ${role === "admin" ? "an admin" : "a member"}.`);
      await loadOrganization();
    } catch (error) {
      toast.error("Role not changed", getApiMessage(error));
    } finally {
      setRoleBusyId("");
    }
  };

  const removeMember = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await api.delete(`/provider/members/${removeTarget._id}`);
      toast.success("Teammate removed", "They no longer have access to this workspace.");
      setRemoveTarget(null);
      await loadOrganization();
    } catch (error) {
      toast.error("Teammate not removed", getApiMessage(error));
    } finally {
      setRemoving(false);
    }
  };

  const respondInvitation = async (invitation, action) => {
    setRespondingId(invitation._id);
    try {
      await api.post(`/team/invitations/${invitation._id}/respond`, { action });
      toast.success(
        action === "accept" ? "Invitation accepted" : "Invitation declined",
        action === "accept" ? "You now have access to the organization workspace." : "The invitation has been dismissed."
      );
      await refresh();
      await Promise.all([loadInvitations(), loadOrganization()]);
    } catch (error) {
      toast.error("Invitation not updated", getApiMessage(error));
    } finally {
      setRespondingId("");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Provider workspace"
        title="Team"
        description="Invite trusted teammates, manage roles, and keep your organization profile current."
      />

      {invitations.length ? (
        <Panel
          title="Invitations for you"
          description="Review organizations that have invited you."
          className="mb-5"
          padded={false}
        >
          <ul className="divide-y divide-white/[0.06]">
            {invitations.map((invitation) => (
              <li key={invitation._id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                <Avatar src={invitation.organization?.logo} name={invitation.organization?.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{invitation.organization?.name || "Organization"}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Invited by {invitation.invitedBy?.name || "a workspace manager"} · {timeAgo(invitation.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    icon={Check}
                    loading={respondingId === invitation._id}
                    onClick={() => respondInvitation(invitation, "accept")}
                    disabled={respondingId !== ""}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => respondInvitation(invitation, "decline")}
                    disabled={respondingId !== ""}
                  >
                    Decline
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {orgState.loading ? (
        <LoadingBlock label="Loading your team workspace" />
      ) : orgState.error ? (
        <ErrorState message={orgState.error} onRetry={loadOrganization} />
      ) : organization ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={ROLE_TONES[orgState.myRole] || "slate"}>
              <ShieldCheck size={11} />
              {orgState.myRole === "owner" ? "You are the owner" : orgState.myRole === "admin" ? "You are an admin" : "You are a member"}
            </Badge>
            <Badge tone="slate">{PROVIDER_TYPE_LABELS[providerProfile?.type] || "Provider"} workspace</Badge>
            {organization.slug ? <span className="text-[10px] text-slate-600">/{organization.slug}</span> : null}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <Panel title="Organization profile" description="Shared details shown alongside your marketplace presence.">
              <form onSubmit={saveOrganization}>
                <fieldset disabled={!canManage || saving} className="m-0 min-w-0 space-y-4 border-0 p-0">
                  {formError ? <FormError>{formError}</FormError> : null}
                  <ImageUploader
                    value={form.logo}
                    onChange={(value) => {
                      setForm((current) => ({ ...current, logo: value }));
                      setSaved("");
                    }}
                    purpose="logo"
                    label="Organization logo"
                    shape="avatar"
                    hint="Square marks work best."
                  />
                  <Field label="Organization name" htmlFor="org-name" required error={fieldErrors.name}>
                    <Input
                      id="org-name"
                      value={form.name}
                      onChange={(event) => {
                        setForm((current) => ({ ...current, name: event.target.value }));
                        setSaved("");
                      }}
                      maxLength={140}
                      invalid={Boolean(fieldErrors.name)}
                    />
                  </Field>
                  <Field label="Description" htmlFor="org-description" error={fieldErrors.description} hint="What the organization does and who it serves.">
                    <TextArea
                      id="org-description"
                      rows={4}
                      value={form.description}
                      onChange={(event) => {
                        setForm((current) => ({ ...current, description: event.target.value }));
                        setSaved("");
                      }}
                      maxLength={3000}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Industry" htmlFor="org-industry" error={fieldErrors.industry}>
                      <Input
                        id="org-industry"
                        value={form.industry}
                        onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))}
                        maxLength={100}
                        placeholder="Software development"
                      />
                    </Field>
                    <Field label="Company size" htmlFor="org-size" error={fieldErrors.companySize}>
                      <Select
                        id="org-size"
                        value={form.companySize}
                        onChange={(event) => setForm((current) => ({ ...current, companySize: event.target.value }))}
                      >
                        <option value="">Not specified</option>
                        <option value="1–10">1–10 people</option>
                        <option value="11–50">11–50 people</option>
                        <option value="51–200">51–200 people</option>
                        <option value="201–500">201–500 people</option>
                        <option value="500+">500+ people</option>
                      </Select>
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Location" htmlFor="org-location" error={fieldErrors.location}>
                      <Input
                        id="org-location"
                        value={form.location}
                        onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                        maxLength={160}
                        placeholder="Austin, TX"
                      />
                    </Field>
                    <Field label="Year established" htmlFor="org-year" error={fieldErrors.yearEstablished}>
                      <Input
                        id="org-year"
                        type="number"
                        min="1900"
                        max="2100"
                        value={form.yearEstablished}
                        onChange={(event) => setForm((current) => ({ ...current, yearEstablished: event.target.value }))}
                        placeholder="2018"
                        invalid={Boolean(fieldErrors.yearEstablished)}
                      />
                    </Field>
                  </div>
                  <Field label="Website" htmlFor="org-website" error={fieldErrors.website}>
                    <Input
                      id="org-website"
                      value={form.website}
                      onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                      maxLength={300}
                      placeholder="https://yourstudio.com"
                    />
                  </Field>

                  {canManage ? (
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/8 pt-4">
                      {saved ? <p className="mr-auto text-xs text-mint-300">{saved}</p> : null}
                      <Button type="submit" icon={Check} loading={saving}>
                        Save organization
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">Only owners and admins can edit these details.</p>
                  )}
                </fieldset>
              </form>
            </Panel>

            <div className="space-y-5">
              <Panel title="Team members" description={`${orgState.members.filter((member) => member.status === "active").length} active · ${orgState.members.length} total`} padded={false}>
                <ul className="divide-y divide-white/[0.06]">
                  {orgState.members.map((member) => {
                    const memberUser = member.user;
                    const isSelf = String(memberUser?._id) === String(user?._id);
                    const status = MEMBER_STATUS[member.status] || MEMBER_STATUS.active;
                    return (
                      <li key={member._id} className="px-4 py-3.5 sm:px-5">
                        <div className="flex items-center gap-3">
                          <Avatar src={memberUser?.avatar} name={memberUser?.name || "Teammate"} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-slate-100">
                              {memberUser?.name || "Former teammate"}
                              {isSelf ? <span className="ml-1.5 text-[10px] text-brand-300">You</span> : null}
                            </p>
                            <p className="mt-0.5 truncate text-[10px] text-slate-500">{memberUser?.email || "No longer available"}</p>
                          </div>
                          {member.role === "owner" || !canManage || isSelf ? (
                            <Badge tone={ROLE_TONES[member.role] || "slate"}>{member.role}</Badge>
                          ) : (
                            <Select
                              value={member.role}
                              onChange={(event) => changeRole(member, event.target.value)}
                              disabled={Boolean(roleBusyId)}
                              className="w-[92px] !px-2 !py-1.5 text-[11px]"
                              aria-label={`Role for ${memberUser?.name || "teammate"}`}
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                            </Select>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 pl-[52px]">
                          <Badge tone={status.tone} dot={member.status === "active"}>
                            {status.label}
                          </Badge>
                          {member.joinedAt ? (
                            <span className="text-[10px] text-slate-600">Joined {formatDate(member.joinedAt)}</span>
                          ) : null}
                          {member.role !== "owner" && canManage && !isSelf ? (
                            <button
                              type="button"
                              onClick={() => setRemoveTarget(member)}
                              className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-500 transition hover:text-rose-300"
                            >
                              <Trash2 size={11} />
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Panel>

              {canManage ? (
                <Panel title="Invite a teammate" description="They receive an invitation and must accept before gaining access.">
                  <form onSubmit={invite} className="space-y-3">
                    {inviteError ? <FormError>{inviteError}</FormError> : null}
                    <Field
                      label="Email address"
                      htmlFor="invite-email"
                      hint="The person must already have a BuildBridge provider account that is not running its own provider profile."
                    >
                      <Input
                        id="invite-email"
                        type="email"
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
                        placeholder="teammate@example.com"
                        required
                      />
                    </Field>
                    <Button type="submit" icon={Plus} loading={inviting} className="w-full">
                      Send invitation
                    </Button>
                  </form>
                </Panel>
              ) : null}

              <div className="surface rounded-2xl p-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Mail size={13} className="text-brand-300" />
                  How access works
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                  Owners control the workspace. Admins can edit the profile, services, portfolio, and team. Members can
                  work on inquiries and messages without changing the public profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <EmptyState
            icon={Building2}
            title={providerProfile ? "No organization workspace" : "No team workspace yet"}
            description={
              !providerProfile
                ? `This teammate account is not part of an organization yet. Accept a pending invitation above, or ask an owner to invite ${user?.email || "the email on this account"}.`
                : providerProfile.type === "freelancer" || providerProfile.type === "developer"
                  ? "Team workspaces are available for company, agency, and studio accounts. You can keep managing everything from your personal provider profile."
                  : "This provider account is not linked to an organization yet. Contact support if you expected a shared workspace."
            }
            action={
              providerProfile ? (
                <Link to="/dashboard/provider/profile" className="btn btn-secondary px-4 py-2.5 text-sm">
                  <Users size={14} />
                  Go to your profile
                </Link>
              ) : (
                <Link to="/dashboard/settings" className="btn btn-secondary px-4 py-2.5 text-sm">
                  <Users size={14} />
                  Review account details
                </Link>
              )
            }
          />
          <div className="mx-auto max-w-lg rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-white">
              <AlertTriangle size={13} className="text-amber-200" />
              Looking for a team invitation?
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
              Pending invitations appear at the top of this page. If none are shown, ask an organization owner to invite
              the email address on your account.
            </p>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(removeTarget)}
        onClose={() => (removing ? null : setRemoveTarget(null))}
        onConfirm={removeMember}
        title="Remove this teammate?"
        message={`${removeTarget?.user?.name || "This teammate"} will immediately lose access to the organization workspace. They can be invited again later.`}
        confirmLabel="Remove teammate"
        busy={removing}
      />
    </div>
  );
}
