---
title: Primal-dual Approach toward CMDP
date: 2026-07-30
tags: [research]
---

# Primal-dual Approach toward CMDP

In this notes, I want to record the literature review on the primal-dual algorithms for constrained Markov decision process (CMDP).

## Background

My current research is about the application of Wasserstein policy gradient method on CMDP with primal policy entropy regularized. Through some searching and reading, I found [Ying's paper](https://arxiv.org/pdf/2110.08923) particularly illuminating, since it also considers a primal-dual algorithm for entropy-regularized CMDP. Besides, [Chen's paper](https://doi.org/10.1287/mnsc.2022.03736), [Ding's paper](https://arxiv.org/pdf/2306.11700) are also helpful. There are many other papers considering similar approach, so in this note I want to organize the algorithms in a clearer way.

## Preliminary on Constrained MDP

A standard Markov decision process contains an agent, a state space of agent $\mathcal S$, an action space for the agent $\mathcal A$, a state transition kernel $P(\cdot|s,a)$ and a reward function $r(s,a)$.

We consider the discrete-time, discounted accumulation reward version. The agent will go through time steps $n=0,1,\cdots$, being in some state $s\in \mathcal S$, taking some action $a\in \mathcal A$ and getting reward according to its state and action $r(s,a)$ at each time step. The state of the agent at time $n+1$ depends on the state and action of agent at time $n$ according to the state transition kernel $s_{n+1}\sim P(\cdot|s_n,a_n).$

The policy of the agent is the rule of the agent for taking actions given states, and mathematically a probability measure over the action space. The policy is Markov if the policy depends solely on the current state. We consider Markov policy here.


The reward can be soft sometimes. If the state $s\sim \rho\in \Delta(\mathcal S)$, then the soft reward is
\[
    \mathbb E_{s\sim \rho,\ a\sim \pi(\cdot|s)}[r(s,a)]\]

The discounted accumulated total reward of one policy $\pi\in \Delta(\mathcal A)^{\mathcal S}$ will be
\[
    R(\pi) = \sum_{n=0}^\infty \gamma^nr(s_n,a_n),\]
where the initial state distribution $s_0\sim\rho_0$ is given.

Similarly, we can define the discounted cost of a policy given some cost functions $c_i(s,a)$ as above $C_i(\pi)$. We may have some constraint $C_i(\pi)\le b_i,\ i=1,\cdots, m$ for the policy. The constrained MDP is the optimization problem where decision variable is policy
\[
\begin{aligned}
    &\max_\pi J(\pi)\\
    &s.t. \; C_i(\pi)\ge 0,\; i=1,\cdots,m.
\end{aligned}
\]

### Application of Constrained MDP

Here to illustrate the broad applicability and substantial practical utility of CMDP, we give a few instances and references on the application of CMDP in various settings.

- Inventory Management

Reference: [Chen et al.](https://doi.org/10.1287/mnsc.2022.03736), [Feinberg et al.](https://onlinelibrary.wiley.com/doi/abs/10.1002/nav.21750)

- Queue Scheduling

Reference: [Chen et al.](https://doi.org/10.1287/mnsc.2022.03736)

- Emergency Department Patient Scheduling

Reference: [Giard et al.](https://doi.org/10.1002/nav.21893)

- Robotics Control

Reference: [Lee et al.](https://arxiv.org/pdf/2309.15430)

## Primal-dual Approach vs Dual Approach

We want to utilize the policy-gradient based algorithms for MDPs in our constrained setting. This idea requires a Lagrangian formulation of the problem and a strong duality theorem to faciliate the application of classic algorithms for MDPs. The primal-dual approach for the CMDP grows from the idea from [Le et al.](https://arxiv.org/pdf/1903.08738)).

The dual approach refers to a framework of an algorithm, which updates the dual function as the main part and the update of primal policy (like policy gradient methods) only serves the approximation for dual gradient information; primal-dual approach refers to the framework that iteratively update the primal policy and dual multiplier at the same time.

One common technical part is to control the optimality gap and constraint violation with the error of the algorithm.

[Chen et al.](https://doi.org/10.1287/mnsc.2022.03736) (Section 3) points out the weakness of pure dual approach, which solves the inner loop first at each iteration and then update the dual through a precise dual (sub)gradient information. Thus this paper propose one data-driven algorithm that only requires a policy iteration at each iteration.

[Ying et al.](https://arxiv.org/pdf/2110.08923) uses NPG as subroutine to update the primal policy to near optimal for every given multiplier, and then update the dual multiplier through enough precise gradient information. The keys to the proof are

- The entropy regularizer for primal policy facilitates the smoothness of the dual function, which enables faster dual update.
- The NPG method has linear convergence rate, so we can derive precise enough gradient information with only a few steps.
- The accelerated gradient projection method permits inexact gradient information for controlling error bound.

The convergence proof in dual approach is quite standard, since the results from Euclidean optimization, policy gradient update, can be invoked directly and all we have to do is to couple the results and compute the convergence rate.

### Basics

#### Duality Problem and Duality Theorem

First we can transform the initial problem into a Lagrangian max-min problem
$$
    \max_\pi \min_{\lambda\in \mathbb R^m_+} L(\pi,\lambda) = J(\pi)+\lambda^TC(\pi),$$
where $C(\pi) = (C_1(\pi),\cdots,C_m(\pi))^T.$
Then if the strong duality for our problem holds, by switching the sequence of taking maximum and minimum, we can convert the inner problem into a normal reinforcement learning problem that arguments the dual multiplier term into the reward function. 
$$
    \max_\pi \min_{\lambda\in \mathbb R^m_+} L(\pi,\lambda)  = \min_{\lambda\in \mathbb R^m_+}\max_\pi L(\pi,\lambda) = J(\pi)+\lambda^TC(\pi)$$
Then we can solve the dual problem by updating the policy by a policy-gradient based method toward the best response policy given current multiplier, and then updating the multiplier according to the gradient information provided by the approximated policy. Since the policy gradient provided by the policy is not accurate, we want the outer optimization method for the dual multiplier to be robust. Thus we mostly apply first-order method to update the dual multiplier.

The duality in literature is often established for CMDPs with some constraints:

- [Le et al.](https://arxiv.org/pdf/1903.08738): compact state space, finite action space, convex policy famlily (What linearity structure is the convexity of policy set established on?)
- [Chen et al.](https://doi.org/10.1287/mnsc.2022.03736) (Section 4, based on [Altman](https://www-sop.inria.fr/members/Eitan.Altman/TEMP/h.pdf)) 
  1. strong duality holds for finite state space and action space
  2. further for countably infinite state space, instantaneous reward and costs being uniformly bounded from below
- [Ying et al.](https://arxiv.org/pdf/2110.08923) (entropy-regularized): finite state space and action space; the admissible policy space is softmax parametrized family. Given above setting, the strong duality is assumed. Appendix D gives a entropy temperature bound for duality gap when strong duality does not hold.
- [Paternain et al.](https://arxiv.org/pdf/1911.09101): Compact state space and action space, bounded instantaneous reward, strict feasibility (Slater's condition)

#### Policy-gradient Method for MDP

**Policy gradient theorem**(1983) is derived in [Sutton et al.](https://proceedings.neurips.cc/paper_files/paper/1999/file/464d828b85b0bed98e80ade0a5c43b0f-Paper.pdf?utm_source=chatgpt.com).

$$
\nabla_{\theta} J(\theta)
=
\frac{1}{1-\gamma}
\mathbb{E}_{\substack{
S \sim d_{\rho}^{\pi_{\theta}}
A \sim \pi_{\theta}(\cdot \mid S)
}}
\left[
Q^{\pi_{\theta}}(S,A)\,
\nabla_{\theta}\log \pi_{\theta}(A \mid S)
\right].
$$

**Actor-Crtic.**(2001) [Konda et al.](https://www.mit.edu/~jnt/Papers/J094-03-kon-actors.pdf) provides the mathematical foundation of actor-critic algorithms.

**Natural Policy Gradient.**(2001) Considering the different geometry of parameter space and the policy space, the performance of updating the policy by solely considering parameter geometry will have big variance. To address this problem, [Kakade](https://proceedings.neurips.cc/paper/2001/file/4b86abe48d358ecf194c56c69108433e-Paper.pdf?utm_source=chatgpt.com) provides natural policy gradient to take the geometry of policy space into consideration.

**Deterministic Policy Gradient.**(2014) This method solely consider the deterministic policies $a = \mu_\theta(s)$ instead of usual stochastic policies. This method performs well on the high-dimensional problems and MDP with continuous action spaces. The basic reference is [Silver et al.](https://proceedings.mlr.press/v32/silver14.pdf?utm_source=chatgpt.com), and a reference on DPG for CMDP is [Rozada et al.](https://arxiv.org/pdf/2408.10015).

#### Outer-loop Optimization method

The inner policy optimization could not achieve the exact the best response for given multiplier, so the gradient information provided by the current policy will not be accurate. This requires the optimization method for the dual multiplier to be robust, in a sense that the algorithm is stable even when the gradient information fluctuates.

[Ying et al.](https://arxiv.org/pdf/2110.08923) (Section 3) chooses first-order methods, including [gradient projection method](https://web.mit.edu/dimitrib/www/OntheGoldstein.pdf), [Frank-Wolfe algorithm](https://en.wikipedia.org/wiki/Frank%E2%80%93Wolfe_algorithm). The reason Ying can apply gradient method is that the smoothness of the dual function is established (with the help of entropy regularizer).

[Chen et al.](https://doi.org/10.1287/mnsc.2022.03736) (Section 4) and [Ding et al.](https://arxiv.org/pdf/2206.02346) (Section 3) and [Paternain et al.](https://arxiv.org/pdf/1911.09101) (Section VI) choose [projected subgradient method](https://web.stanford.edu/class/ee364b/lectures/subgrad_method_notes.pdf) to update the dual multiplier. One thing reader should check is whether the projection space is the same in these settings.

#### Mirror Descent method

Mirror descent method is inspired from the quadratic approximation interpretation for gradient descent method.

The usual gradient descent update is $x_{t+1} =x_t-\eta_t\nabla f(x_t).$ It's actually the explicit update form of

$$
x_{t+1}
=
\argmin_{x\in\mathbb R^d}
\left\{
\left\langle \nabla f(x_t),x-x_t\right\rangle
+
\frac{1}{2\eta_t}\|x-x_t\|_2^2
\right\}.
$$

Mirror descent simply replaces the Euclidean distance $\|x-x_t\|_2^2$ with a Bregman divergence $D_h(x,x_t)$, which is defined by a strongly convex function $h$. The update can be understood as an update through a mirror space.

Let $z_t:=\nabla h(x_t).$ Then we update this mirror variable by gradient descent 
$$z_{t+1}=z_t-\eta_t\nabla f(x_t),$$
and then map back to the original space by $x_{t+1} = \nabla h^*(z_{t+1})$, where $h^*$ is the convex conjugate of $h$.

The gradient descent can be regarded as a special case of mirror descent with $h(x) = \frac{1}{2}\|x\|_2^2.$

### Primal-Dual Approach Convergence Details

The primal-dual approach though provides computation efficient algorithm, it has to tackle the coupled obstacles caused by primal-dual coupled iteration, such as oscillation of algorithm near the saddle point. In this part, we aim to understand the convergence mechanism by considering methods of [Chen et al.](https://doi.org/10.1287/mnsc.2022.03736) as template.

The big picture of Chen's covergence proof for ideal algorithm (Q-function can be evaluated exactly, thus the projection error is not considered) is as follows:

- Occupancy measure formulation of the problem makes it convex
- One-step primal and dual update error inequality (Lemma 1 in [Chen et al.](https://doi.org/10.1287/mnsc.2022.03736)), the bound create a telescoping structure for averaging the primal and dual trajectories; this creates the saddle gap
- The optimality gap and contraint violation is controlled via the saddle gap; specific convergence rate is derived by choosing appropriate step size

This ideal algorithm is then applied to small scale problems in queue scheduling and inventory management.

Chen's paper later presents an algorithm considering projection error. This is a more practical algorithm in real large-scale problems. The extra neural projection error is considered for real implementation.

The main difference of proof for this theorem is the incorporation of the projection error to the one step primal update error lemma (the dual part of the lemma remains the same). The main theorem proof is in similar manner with the ideal version.

**Remark.** These speculation of the convergence proof shows that the most important part for a primal-dual algorithm is the control for the primal one-step update error. This error should be different in different primal update methods, like NPG in [Ding et al.](https://arxiv.org/pdf/2206.02346), Mirror Descent in [Chen et al.](https://doi.org/10.1287/mnsc.2022.03736).
